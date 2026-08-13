-- =============================================================================
-- NOORE · M008 — ADMIN SECURITY FOUNDATION (Phase 5)
--
-- Builds the DB-authoritative staff authorization layer on top of M005/M006:
--   * staff_members / staff_invites / admin_audit_logs stay UNREADABLE to the
--     browser (no grants, RLS on, no policies). All staff access goes through
--     the SECURITY DEFINER functions below.
--   * admin_log() is hardened: it self-verifies the caller is an active staff
--     member and stamps actor_id + role_snapshot from auth.uid(). Customers who
--     call it directly get a hard error and nothing is logged.
--   * get_my_staff_context() is the ONE read path for the authorization chain
--     (auth.getUser() -> this row -> is_active -> role). Returns NULL for
--     anyone who is not staff — deny by default.
--   * admin_bootstrap_owner() is the one-time owner bootstrap. EXECUTE is
--     granted to NOBODY (not even authenticated) so it is only ever run from
--     the SQL editor as the postgres role. It refuses to run once an owner
--     exists and requires the target user to already exist in auth.users.
--   * create_staff_invite() / consume_staff_invite() are the secure invite
--     foundation: raw 256-bit token is returned to the caller exactly once,
--     only its sha-256 hash is stored, invites expire and are one-time, the
--     email must match, and roles are allow-listed (owner is never creatable
--     by invitation). create_staff_invite enforces owner + AAL2.
--
-- MFA/AAL2: stored entirely in the Supabase `auth` schema (factors). Server
-- side, AAL2 is verified from the validated session JWT (auth.uid()'s token
-- `aal` claim read via auth.jwt() here / supabase.auth.getUser() in the app).
--
-- Idempotent-ish: safe to run twice (IF NOT EXISTS / DROP+CREATE guards).
--
-- Requires: pgcrypto (bundled + enabled by default on Supabase) for sha256().
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Defense in depth: re-affirm the deny-by-default posture on staff tables.
-- ---------------------------------------------------------------------------
alter table public.admin_audit_logs enable row level security;
alter table public.staff_members     enable row level security;
alter table public.staff_invites     enable row level security;

revoke all on table public.admin_audit_logs from anon, authenticated;
revoke all on table public.staff_members     from anon, authenticated;
revoke all on table public.staff_invites     from anon, authenticated;
-- No policies are ever created on these tables: RLS-on + zero grants + no
-- policies => every direct browser statement is denied at the database.

-- ---------------------------------------------------------------------------
-- 1. Audit log: add the actor-role snapshot column (append-only table).
-- ---------------------------------------------------------------------------
alter table public.admin_audit_logs
  add column if not exists role_snapshot text;

-- ---------------------------------------------------------------------------
-- 2. Hardened append-only audit logger.
--
-- Replaces the M006 admin_log(p_action, p_entity, p_entity_id, p_data) with a
-- version that (a) verifies the caller is an ACTIVE staff member and (b) stamps
-- actor_id + role_snapshot from auth.uid() — never from client input.
-- ---------------------------------------------------------------------------
drop function if exists public.admin_log(text, text, uuid, jsonb);

create or replace function public.admin_log(
  p_action text,
  p_entity text default null,
  p_entity_id uuid default null,
  p_data jsonb default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, p_action, p_entity, p_entity_id, p_data);
end;
$$;

revoke all on function public.admin_log(text, text, uuid, jsonb) from public, anon, authenticated;
-- The app logs AFTER its own authorization check; the function still requires
-- an active staff session, so a customer can never write audit rows.
grant execute on function public.admin_log(text, text, uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Staff context — the single read path for the authorization chain.
--    Returns the caller's staff_members row, or NULL if not staff.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_staff_context()
returns staff_members
language sql
security definer
set search_path = ''
stable
as $$
  select s.*
    from public.staff_members s
   where s.id = auth.uid();
$$;

revoke all on function public.get_my_staff_context() from public, anon;
grant execute on function public.get_my_staff_context() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. One-time owner bootstrap. NEVER callable from the browser or the app:
--    EXECUTE is granted to nobody. Run from the SQL editor (postgres role).
-- ---------------------------------------------------------------------------
create or replace function public.admin_bootstrap_owner(p_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user auth.users%rowtype;
begin
  if exists (select 1 from public.staff_members where role = 'owner') then
    raise exception 'owner already exists; bootstrap is one-time only';
  end if;

  select * into v_user
    from auth.users
   where lower(email) = lower(trim(p_email))
   limit 1;

  if v_user.id is null then
    raise exception 'no auth user found for that email; the user must exist in Supabase Auth first';
  end if;

  insert into public.staff_members (id, email, role, is_active, display_name)
  values (
    v_user.id,
    lower(trim(p_email)),
    'owner',
    true,
    nullif(trim(v_user.raw_user_meta_data ->> 'display_name'), '')
  );

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (
    v_user.id,
    'owner',
    'OWNER_BOOTSTRAPPED',
    'staff_members',
    v_user.id,
    jsonb_build_object('email', lower(trim(p_email)))
  );

  return 'owner_bootstrapped';
end;
$$;

revoke all on function public.admin_bootstrap_owner(text) from public, anon, authenticated;
-- Intentionally NO grant: only the SQL editor / postgres role can execute it.

-- ---------------------------------------------------------------------------
-- 5. Staff invitation foundation (service layer; Phase 6 adds the UI).
-- ---------------------------------------------------------------------------
-- 5a. Owner + AAL2 create an invite. Returns the raw token exactly once; only
--     its sha-256 hash is stored. The caller must deliver the token to the
--     recipient out-of-band (Phase 6 email delivery).
create or replace function public.create_staff_invite(p_email text, p_role text)
returns table (invite_id uuid, token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
  v_bytes  bytea := gen_random_bytes(32);
  v_raw    text := encode(v_bytes, 'hex');
  v_hash   text := encode(sha256(v_bytes), 'hex');
  v_invite uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  -- AAL2 is read from the verified session JWT (auth.jwt()), never from input.
  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'owner mfa (aal2) required';
  end if;

  if v_role <> 'owner' then
    raise exception 'only the owner can invite staff';
  end if;

  if p_role not in ('store_manager', 'seo_editor', 'support') then
    raise exception 'role not allowed for invitation';
  end if;

  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'invalid email';
  end if;

  if exists (select 1 from public.staff_members where lower(email) = lower(trim(p_email))) then
    raise exception 'user is already staff';
  end if;

  if exists (select 1 from public.staff_invites
             where lower(email) = lower(trim(p_email))
               and used_at is null
               and expires_at > now()) then
    raise exception 'an invite is already pending for that email';
  end if;

  insert into public.staff_invites (email, role, token_hash, expires_at, invited_by)
  values (lower(trim(p_email)), p_role, v_hash, now() + interval '48 hours', v_actor)
  returning id into v_invite;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (
    v_actor,
    v_role,
    'STAFF_INVITE_CREATED',
    'staff_invites',
    v_invite,
    jsonb_build_object('email', lower(trim(p_email)), 'role', p_role)
  );

  return query select v_invite, v_raw;
end;
$$;

revoke all on function public.create_staff_invite(text, text) from public, anon;
grant execute on function public.create_staff_invite(text, text) to authenticated;

-- 5b. Recipient consumes an invite: validates token hash, expiry, one-time
--     usage and email match, then creates the staff member and marks used.
create or replace function public.consume_staff_invite(p_token text, p_email text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor     uuid := auth.uid();
  v_invite    staff_invites%rowtype;
  v_auth_email text;
  v_display   text;
begin
  select * into v_invite
    from public.staff_invites
   where token_hash = encode(sha256(decode(p_token, 'hex')), 'hex')
     and used_at is null
     and expires_at > now();

  if v_invite.id is null then
    raise exception 'invite invalid or expired';
  end if;

  if v_actor is null then
    raise exception 'not authenticated';
  end if;

  select email into v_auth_email from auth.users where id = v_actor;
  if lower(trim(v_invite.email)) <> lower(trim(v_auth_email)) then
    raise exception 'invite email does not match the signed-in account';
  end if;

  if lower(trim(v_invite.email)) <> lower(trim(p_email)) then
    raise exception 'invite email does not match the signed-in account';
  end if;

  if exists (select 1 from public.staff_members where id = v_actor) then
    raise exception 'already staff';
  end if;

  select raw_user_meta_data ->> 'display_name' into v_display from auth.users where id = v_actor;

  insert into public.staff_members (id, email, role, is_active, display_name)
  values (v_actor, lower(trim(v_invite.email)), v_invite.role, true, nullif(trim(v_display), ''));

  update public.staff_invites set used_at = now() where id = v_invite.id;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (
    v_actor,
    v_invite.role,
    'STAFF_INVITE_CONSUMED',
    'staff_invites',
    v_invite.id,
    jsonb_build_object('email', lower(trim(v_invite.email)), 'role', v_invite.role)
  );

  return 'staff_created';
end;
$$;

revoke all on function public.consume_staff_invite(text, text) from public, anon;
grant execute on function public.consume_staff_invite(text, text) to authenticated;
