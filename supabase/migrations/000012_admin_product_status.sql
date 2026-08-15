-- =============================================================================
-- NOORE · M012 — Admin product visibility + status toggle (Phase 6 Fix)
--
-- Confirmed gap: deactivating a product hid it from /admin/products entirely,
-- so the Owner could not reactivate it from the admin interface.
--
-- Root cause:
--   * M006's RLS policy `products_select_active` hides is_active = false rows
--     from EVERY authenticated SELECT — including staff. The admin product list
--     and edit page read products via direct SELECT, so inactive products
--     vanished from the UI even though the row stayed in the database.
--   * M011's `update_product` made is_active owner-only, and the deactivate UI
--     explicitly said reactivation was unavailable this phase.
--
-- This migration fixes BOTH without weakening the public storefront:
--   1. Adds `is_catalog_admin()` (SECURITY DEFINER) and an additive RLS policy
--      so staff with catalog.view (owner, store_manager, seo_editor) can SELECT
--      active AND inactive products. Anonymous/non-staff behavior is unchanged:
--      `products_select_active` still limits public reads to active products.
--   2. Adds `set_product_status()` (SECURITY DEFINER) — the single status
--      control for deactivate AND reactivate, allowed for owner or store
--      manager, both requiring AAL2 (consistent with update_product /
--      deactivate_product). Writes PRODUCT_DEACTIVATED / PRODUCT_REACTIVATED
--      audit rows only when the status actually changes.
--
-- No existing policy, function or grant is removed or altered.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Staff catalog visibility helper — used by the RLS policy below.
--    Returns true only for ACTIVE staff holding catalog.view. SECURITY
--    DEFINER so staff_members (RLS-on, zero grants) can be read; the caller
--    can never read the row, only the boolean verdict.
-- ---------------------------------------------------------------------------
create or replace function public.is_catalog_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.staff_members s
     where s.id = auth.uid()
       and s.is_active = true
       and s.role in ('owner', 'store_manager', 'seo_editor')
  );
$$;

revoke all on function public.is_catalog_admin() from public, anon, authenticated;
grant execute on function public.is_catalog_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Additive RLS policy: staff may SELECT all products (active + inactive).
--    Policies combine with OR, so anon/non-staff authenticated still only see
--    active products via `products_select_active` (M006) — public security is
--    unchanged. Table grants are unchanged (M010 grants SELECT to anon +
--    authenticated; only RLS filters which rows each role may see).
-- ---------------------------------------------------------------------------
create policy "products_select_staff" on public.products
  for select to authenticated
  using (public.is_catalog_admin());

-- ---------------------------------------------------------------------------
-- 3. set_product_status — deactivate / reactivate, one RPC.
--    Requires: OWNER or STORE_MANAGER, both with AAL2 (sensitive status op).
--    Effects:
--      * flips products.is_active
--      * writes PRODUCT_DEACTIVATED or PRODUCT_REACTIVATED audit row (only on
--        an actual change; a no-op returns 'no_change' without auditing)
-- ---------------------------------------------------------------------------
create or replace function public.set_product_status(
  p_product_id uuid,
  p_is_active  boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor      uuid := auth.uid();
  v_role       text;
  v_cur_active boolean;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may change product status';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_is_active is null then
    raise exception 'invalid status';
  end if;

  select is_active into v_cur_active
    from public.products
   where id = p_product_id;

  if v_cur_active is null then
    raise exception 'product not found';
  end if;

  if v_cur_active = p_is_active then
    return 'no_change';
  end if;

  update public.products
     set is_active = p_is_active,
         updated_at = now()
   where id = p_product_id;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (
    v_actor,
    v_role,
    case when p_is_active then 'PRODUCT_REACTIVATED' else 'PRODUCT_DEACTIVATED' end,
    'products',
    p_product_id,
    jsonb_build_object('product_id', p_product_id, 'is_active', p_is_active)
  );

  return case when p_is_active then 'product_reactivated' else 'product_deactivated' end;
end;
$$;

revoke all on function public.set_product_status(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_product_status(uuid, boolean) to authenticated;
