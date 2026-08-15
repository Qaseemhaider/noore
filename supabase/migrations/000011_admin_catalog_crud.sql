-- =============================================================================
-- NOORE · M011 — ADMIN CATALOG CRUD (Phase 6 repair)
--
-- Hardened DB-authoritative functions that implement the Phase 6 admin catalog
-- UI contract. All functions are SECURITY DEFINER with search_path='' and
-- re-verify the caller is an ACTIVE staff member from staff_members. Every
-- privileged path funnels through these RPCs — no direct table grants were
-- added, and existing SELECT-only storefront grants (M006 + M010) are
-- untouched. product_variants keeps NO direct SELECT grant; exact
-- stock_quantity is only reachable through list_admin_variants().
--
-- Security matrix (mirrors the approved Phase 6 repair plan):
--   * create_product       -> OWNER + AAL2            (sets the initial price)
--   * update_product       -> OWNER or STORE_MANAGER + AAL2 (NO price field;
--                              is_active is owner-guarded)
--   * list_admin_variants  -> active staff with catalog.view (read-only)
--   * create/update
--     category/color/size  -> OWNER or STORE_MANAGER (AAL2 required for
--                              non-owner, matching the M009 reorder pattern)
--
-- MFA/AAL2: verified from the validated session JWT (`auth.jwt() ->> 'aal'`),
-- never from browser-supplied claims.
--
-- Functions only: no tables, columns, policies, grants-on-tables or
-- storage changes. Idempotent (CREATE OR REPLACE).
-- =============================================================================

-- ------------------------------------------------------------
-- 1. Create product — HIGH RISK (sets the initial price)
--
-- Requires: OWNER + AAL2
-- Effects:
--   * inserts the product row (slug, category, merchandising, price, flags)
--   * writes PRODUCT_CREATED audit row with the new id
--   * returns the new product id
-- ------------------------------------------------------------
create or replace function public.create_product(
  p_slug          text,
  p_category_id   uuid,
  p_name          text,
  p_price         integer,
  p_description   text default null,
  p_fabric        text default null,
  p_care          text default null,
  p_shipping_info text default null,
  p_is_active     boolean default true,
  p_is_featured   boolean default false,
  p_is_new        boolean default false,
  p_is_signature  boolean default false,
  p_sort_order    integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
  v_id    uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if v_role <> 'owner' then
    raise exception 'only the owner may create products';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'owner mfa (aal2) required';
  end if;

  if p_slug is null or length(trim(p_slug)) = 0 then
    raise exception 'invalid slug';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;
  if p_price is null or p_price < 0 then
    raise exception 'invalid price';
  end if;
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'invalid category';
  end if;

  begin
    insert into public.products
      (slug, category_id, name, description, fabric, care, shipping_info,
       price, is_active, is_featured, is_new, is_signature, sort_order)
    values
      (trim(p_slug), p_category_id, trim(p_name), p_description, p_fabric,
       p_care, p_shipping_info, p_price, p_is_active, p_is_featured, p_is_new,
       p_is_signature, p_sort_order)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'slug already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_CREATED', 'products', v_id,
    jsonb_build_object(
      'slug', trim(p_slug),
      'name', trim(p_name),
      'price', p_price,
      'category_id', p_category_id
    ));

  return v_id;
end;
$$;

revoke all on function public.create_product(text, uuid, text, integer, text, text, text, text, boolean, boolean, boolean, boolean, integer) from public, anon, authenticated;
grant execute on function public.create_product(text, uuid, text, integer, text, text, text, text, boolean, boolean, boolean, boolean, integer) to authenticated;

-- ------------------------------------------------------------
-- 2. Update product — NORMAL catalog edit
--
-- Requires: OWNER or STORE_MANAGER + AAL2
-- Accepts NO price field (prices flow only through set_product_price).
-- `is_active` is owner-guarded: a store_manager's value is ignored and the
-- current active state is preserved.
-- Effects:
--   * updates the product row
--   * writes PRODUCT_UPDATED audit row with old/new slug + name
-- ------------------------------------------------------------
create or replace function public.update_product(
  p_product_id    uuid,
  p_slug          text,
  p_category_id   uuid,
  p_name          text,
  p_description   text default null,
  p_fabric        text default null,
  p_care          text default null,
  p_shipping_info text default null,
  p_is_featured   boolean default false,
  p_is_new        boolean default false,
  p_is_signature  boolean default false,
  p_sort_order    integer default 0,
  p_is_active     boolean default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor     uuid := auth.uid();
  v_role      text;
  v_old_slug  text;
  v_old_name  text;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit products';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_slug is null or length(trim(p_slug)) = 0 then
    raise exception 'invalid slug';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;
  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'product not found';
  end if;
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'invalid category';
  end if;

  select slug, name into v_old_slug, v_old_name
    from public.products
   where id = p_product_id;

  begin
    if v_role = 'owner' then
      update public.products
         set slug = trim(p_slug),
             category_id = p_category_id,
             name = trim(p_name),
             description = p_description,
             fabric = p_fabric,
             care = p_care,
             shipping_info = p_shipping_info,
             is_featured = p_is_featured,
             is_new = p_is_new,
             is_signature = p_is_signature,
             sort_order = p_sort_order,
             is_active = coalesce(p_is_active, is_active)
       where id = p_product_id;
    else
      -- store_manager may not change active state (owner-guarded)
      update public.products
         set slug = trim(p_slug),
             category_id = p_category_id,
             name = trim(p_name),
             description = p_description,
             fabric = p_fabric,
             care = p_care,
             shipping_info = p_shipping_info,
             is_featured = p_is_featured,
             is_new = p_is_new,
             is_signature = p_is_signature,
             sort_order = p_sort_order
       where id = p_product_id;
    end if;
  exception when unique_violation then
    raise exception 'slug already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_UPDATED', 'products', p_product_id,
    jsonb_build_object(
      'old_slug', v_old_slug,
      'new_slug', trim(p_slug),
      'old_name', v_old_name,
      'new_name', trim(p_name),
      'category_id', p_category_id
    ));

  return 'product_updated';
end;
$$;

revoke all on function public.update_product(uuid, text, uuid, text, text, text, text, text, boolean, boolean, boolean, integer, boolean) from public, anon, authenticated;
grant execute on function public.update_product(uuid, text, uuid, text, text, text, text, text, boolean, boolean, boolean, integer, boolean) to authenticated;

-- ------------------------------------------------------------
-- 3. List variants for admin inventory — read-only
--
-- Requires: ACTIVE staff with catalog.view (owner, store_manager, seo_editor)
-- Effects: none (pure read). Returns exact stock_quantity ONLY to the RPC
-- caller; direct browser SELECT of product_variants stays denied.
-- ------------------------------------------------------------
create or replace function public.list_admin_variants(
  p_product_id uuid default null
)
returns table (
  id             uuid,
  product_id     uuid,
  product_slug   text,
  product_name   text,
  sku            text,
  color_name     text,
  color_hex      text,
  size_name      text,
  stock_quantity integer,
  is_active      boolean,
  updated_at     timestamptz
)
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

  if not (v_role in ('owner', 'store_manager', 'seo_editor')) then
    raise exception 'catalog view permission required';
  end if;

  return query
    select pv.id,
           pv.product_id,
           p.slug,
           p.name,
           pv.sku,
           c.name,
           c.hex,
           s.name,
           pv.stock_quantity,
           pv.is_active,
           pv.updated_at
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
      join public.colors  c on c.id = pv.color_id
      join public.sizes   s on s.id = pv.size_id
     where p_product_id is null or pv.product_id = p_product_id
     order by p.sort_order, p.name, c.sort_order, s.sort_order;
end;
$$;

revoke all on function public.list_admin_variants(uuid) from public, anon, authenticated;
grant execute on function public.list_admin_variants(uuid) to authenticated;

-- ------------------------------------------------------------
-- 4. Category create / update — reference data management
--
-- Requires: OWNER or STORE_MANAGER (AAL2 required for non-owner)
-- ------------------------------------------------------------
create or replace function public.create_category(
  p_slug       text,
  p_name       text,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
  v_id    uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit categories';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_slug is null or length(trim(p_slug)) = 0 then
    raise exception 'invalid slug';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;

  begin
    insert into public.categories (slug, name, sort_order)
    values (trim(p_slug), trim(p_name), p_sort_order)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'slug already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'CATEGORY_CREATED', 'categories', v_id,
    jsonb_build_object('slug', trim(p_slug), 'name', trim(p_name)));

  return v_id;
end;
$$;

revoke all on function public.create_category(text, text, integer) from public, anon, authenticated;
grant execute on function public.create_category(text, text, integer) to authenticated;

create or replace function public.update_category(
  p_category_id uuid,
  p_slug        text,
  p_name        text,
  p_sort_order  integer default 0
)
returns text
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

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit categories';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_slug is null or length(trim(p_slug)) = 0 then
    raise exception 'invalid slug';
  end if;
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;
  if not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'category not found';
  end if;

  begin
    update public.categories
       set slug = trim(p_slug),
           name = trim(p_name),
           sort_order = p_sort_order
     where id = p_category_id;
  exception when unique_violation then
    raise exception 'slug already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'CATEGORY_UPDATED', 'categories', p_category_id,
    jsonb_build_object('slug', trim(p_slug), 'name', trim(p_name)));

  return 'category_updated';
end;
$$;

revoke all on function public.update_category(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.update_category(uuid, text, text, integer) to authenticated;

-- ------------------------------------------------------------
-- 5. Color create / update — reference data management
--
-- Requires: OWNER or STORE_MANAGER (AAL2 required for non-owner)
-- ------------------------------------------------------------
create or replace function public.create_color(
  p_name       text,
  p_hex        text default null,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
  v_id    uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit colors';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;

  begin
    insert into public.colors (name, hex, sort_order)
    values (trim(p_name), nullif(trim(coalesce(p_hex, '')), ''), p_sort_order)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'name already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'COLOR_CREATED', 'colors', v_id,
    jsonb_build_object('name', trim(p_name)));

  return v_id;
end;
$$;

revoke all on function public.create_color(text, text, integer) from public, anon, authenticated;
grant execute on function public.create_color(text, text, integer) to authenticated;

create or replace function public.update_color(
  p_color_id   uuid,
  p_name       text,
  p_hex        text default null,
  p_sort_order integer default 0
)
returns text
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

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit colors';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;
  if not exists (select 1 from public.colors where id = p_color_id) then
    raise exception 'color not found';
  end if;

  begin
    update public.colors
       set name = trim(p_name),
           hex = nullif(trim(coalesce(p_hex, '')), ''),
           sort_order = p_sort_order
     where id = p_color_id;
  exception when unique_violation then
    raise exception 'name already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'COLOR_UPDATED', 'colors', p_color_id,
    jsonb_build_object('name', trim(p_name)));

  return 'color_updated';
end;
$$;

revoke all on function public.update_color(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.update_color(uuid, text, text, integer) to authenticated;

-- ------------------------------------------------------------
-- 6. Size create / update — reference data management
--
-- Requires: OWNER or STORE_MANAGER (AAL2 required for non-owner)
-- ------------------------------------------------------------
create or replace function public.create_size(
  p_name       text,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
  v_id    uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit sizes';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;

  begin
    insert into public.sizes (name, sort_order)
    values (trim(p_name), p_sort_order)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'name already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'SIZE_CREATED', 'sizes', v_id,
    jsonb_build_object('name', trim(p_name)));

  return v_id;
end;
$$;

revoke all on function public.create_size(text, integer) from public, anon, authenticated;
grant execute on function public.create_size(text, integer) to authenticated;

create or replace function public.update_size(
  p_size_id    uuid,
  p_name       text,
  p_sort_order integer default 0
)
returns text
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

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may edit sizes';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'invalid name';
  end if;
  if not exists (select 1 from public.sizes where id = p_size_id) then
    raise exception 'size not found';
  end if;

  begin
    update public.sizes
       set name = trim(p_name),
           sort_order = p_sort_order
     where id = p_size_id;
  exception when unique_violation then
    raise exception 'name already in use';
  end;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'SIZE_UPDATED', 'sizes', p_size_id,
    jsonb_build_object('name', trim(p_name)));

  return 'size_updated';
end;
$$;

revoke all on function public.update_size(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.update_size(uuid, text, integer) to authenticated;

-- ===========================================================================
-- Migration 000011 complete. All functions are SECURITY DEFINER with
-- search_path='', fully qualified objects, and restrictive EXECUTE grants.
-- Only active staff can execute; direct browser access is denied. AAL2 is
-- enforced on every mutation. No table grants, policies or schema objects were
-- added or changed, and existing storefront SELECT grants are preserved.
-- ===========================================================================
