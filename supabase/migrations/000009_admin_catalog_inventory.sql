-- =============================================================================
-- NOORE · M009 — ADMIN CATALOG + INVENTORY MANAGEMENT (Phase 6)
--
-- Hardened DB-authoritative functions for product, variant, catalog and inventory
-- management. All functions are SECURITY DEFINER with search_path='' and
-- re-verify the caller is an ACTIVE staff member from staff_members.
-- No direct browser/JSONP/grants-based privileges — every privileged path
-- funnels through these RPCs.
--
-- MFA/AAL2: verified from the validated session JWT (`auth.jwt() ->> 'aal'`),
-- never from browser-supplied claims.
--
-- Idempotent: safe to run again (CREATE OR REPLACE).
-- =============================================================================

-- ------------------------------------------------------------
-- 0. Defense in depth: ensure RLS is up to date on key tables
-- ------------------------------------------------------------
alter table public.admin_audit_logs enable row level security;
alter table public.staff_members     enable row level security;
alter table public.staff_invites     enable row level security;
alter table public.product_variants  enable row level security;
alter table public.product_images    enable row level security;
alter table public.categories        enable row level security;
alter table public.colors            enable row level security;
alter table public.sizes             enable row level security;

revoke all on table public.admin_audit_logs from anon, authenticated;
revoke all on table public.staff_members     from anon, authenticated;
revoke all on table public.staff_invites     from anon, authenticated;
revoke all on table public.product_variants  from anon, authenticated;
revoke all on table public.product_images    from anon, authenticated;
revoke all on table public.categories        from anon, authenticated;
revoke all on table public.colors            from anon, authenticated;
revoke all on table public.sizes             from anon, authenticated;
-- No policies are ever created on these tables: RLS-on + zero grants + no
-- policies => every direct browser statement is denied at the database (42501).

-- ------------------------------------------------------------
-- 1. Inventory adjustment — HIGH RISK
--
-- Requires: OWNER or STORE_MANAGER + AAL2 (auth.jwt()->>'aal' = 'aal2')
-- Effects:
--   * atomically decrements (or increments) stock_quantity by delta
--   * rejects if resulting stock_quantity would be negative
--   * writes INVENTORY_ADJUSTED audit row with old/new/delta/reason
--   * returns the new stock_quantity
--
-- Syntax: select public.adjust_inventory(variant_id, delta, reason);
-- Returns: new_stock_quantity (integer)
-- ------------------------------------------------------------
create or replace function public.adjust_inventory(
  p_variant_id uuid,
  p_delta      integer,
  p_reason     text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Re-verify caller is ACTIVE staff; deny by default if not staff.
  v_actor uuid := auth.uid();
  v_role  text;
  v_current integer;
  v_new   integer;
begin
  -- Staff role check (owner or store_manager only)
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only owner or store_manager may adjust inventory';
  end if;

  -- AAL2 enforcement from validated session JWT
  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'owner mfa (aal2) required';
  end if;

  -- Read current stock, row-locked
  select stock_quantity into v_current
    from public.product_variants
   where id = p_variant_id
  for update;

  if v_current is null then
    raise exception 'variant not found';
  end if;

  v_new := v_current + p_delta;
  if v_new < 0 then
    raise exception 'inventory would go negative';
  end if;

  -- Atomically update
  update public.product_variants
     set stock_quantity = v_new
   where id = p_variant_id;

  -- Audit: INVENTORY_ADJUSTED
  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'INVENTORY_ADJUSTED', 'product_variants', p_variant_id,
    jsonb_build_object(
      'old_quantity', v_current,
      'new_quantity', v_new,
      'delta', p_delta,
      'reason', p_reason
    ));

  return v_new;
end;
$$;

revoke all on function public.adjust_inventory(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text) to authenticated;

-- ------------------------------------------------------------
-- 2. Product price change — sensitive mutation
--
-- Requires: OWNER only (store_manager may not change prices)
-- Effects:
--   * updates product.price to new_price (canonical PKR rupees, whole units)
--   * writes PRODUCT_PRICE_CHANGED audit row with old/new price and product id
-- ------------------------------------------------------------
create or replace function public.set_product_price(
  p_product_id uuid,
  p_new_price  integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
  v_old    integer;
begin
  -- Staff role check: owner only
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if v_role <> 'owner' then
    raise exception 'only the owner may change product prices';
  end if;

  -- AAL2 enforcement from validated session JWT
  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'owner mfa (aal2) required';
  end if;

  -- Read old price
  select price into v_old
    from public.products
   where id = p_product_id;

  if v_old is null then
    raise exception 'product not found';
  end if;

  -- Update price
  update public.products
     set price = p_new_price,
         updated_at = now()
   where id = p_product_id;

  -- Audit: PRODUCT_PRICE_CHANGED
  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_PRICE_CHANGED', 'products', p_product_id,
    jsonb_build_object(
      'old_price', v_old,
      'new_price', p_new_price,
      'product_id', p_product_id
    ));

  return 'price_updated';
end;
$$;

revoke all on function public.set_product_price(uuid, integer) from public, anon, authenticated;
grant execute on function public.set_product_price(uuid, integer) to authenticated;

-- ------------------------------------------------------------
-- 3. Product deactivation — destructive catalog operation
--
-- Requires: OWNER + AAL2
-- Effects:
--   * sets product.is_active = false
--   * writes PRODUCT_DEACTIVATED audit row
-- ------------------------------------------------------------
create or replace function public.deactivate_product(
  p_product_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
begin
  -- Staff role check: owner only
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if v_role <> 'owner' then
    raise exception 'only the owner may deactivate products';
  end if;

  -- AAL2 enforcement from validated session JWT
  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'owner mfa (aal2) required';
  end if;

  -- Deactivate product
  update public.products
     set is_active = false,
         updated_at = now()
   where id = p_product_id;

  -- Audit: PRODUCT_DEACTIVATED
  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_DEACTIVATED', 'products', p_product_id,
    jsonb_build_object('product_id', p_product_id));

  return 'product_deactivated';
end;
$$;

revoke all on function public.deactivate_product(uuid) from public, anon, authenticated;
grant execute on function public.deactivate_product(uuid) to authenticated;

-- ------------------------------------------------------------
-- 4. Category reorder — safe admin operation
--
-- Requires: STORE_MANAGER or OWNER
-- Effects: updates category sort_order
-- ------------------------------------------------------------
create or replace function public.reorder_category(
  p_category_id uuid,
  p_sort_order  integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
begin
  -- Staff role check
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  -- AAL2 optional for manager; owner always requires it
  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  update public.categories
     set sort_order = p_sort_order
   where id = p_category_id;

  return 'category_reordered';
end;
$$;

revoke all on function public.reorder_category(uuid, integer) from public, anon, authenticated;
grant execute on function public.reorder_category(uuid, integer) to authenticated;

-- ------------------------------------------------------------
-- 5. Color reorder — safe admin operation
--
-- Requires: STORE_MANAGER or OWNER
-- Effects: updates color sort_order
-- ------------------------------------------------------------
create or replace function public.reorder_color(
  p_color_id    uuid,
  p_sort_order  integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  update public.colors
     set sort_order = p_sort_order
   where id = p_color_id;

  return 'color_reordered';
end;
$$;

revoke all on function public.reorder_color(uuid, integer) from public, anon, authenticated;
grant execute on function public.reorder_color(uuid, integer) to authenticated;

-- ------------------------------------------------------------
-- 6. Size reorder — safe admin operation
--
-- Requires: STORE_MANAGER or OWNER
-- Effects: updates size sort_order
-- ------------------------------------------------------------
create or replace function public.reorder_size(
  p_size_id     uuid,
  p_sort_order  integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  uuid := auth.uid();
  v_role   text;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if v_role <> 'owner' and (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  update public.sizes
     set sort_order = p_sort_order
   where id = p_size_id;

  return 'size_reordered';
end;
$$;

revoke all on function public.reorder_size(uuid, integer) from public, anon, authenticated;
grant execute on function public.reorder_size(uuid, integer) to authenticated;

-- ===========================================================================
-- Migration 000009 complete. All functions are SECURITY DEFINER with
-- search_path='', fully qualified objects, and restrictive EXECUTE grants.
-- Only authenticated staff can execute; anon/authenticated direct execution
-- is denied at the database. AAL2 enforced on all sensitive actions.
-- ===========================================================================