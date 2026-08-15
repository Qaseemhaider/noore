-- ---------------------------------------------------------------------------
-- Migration 000014: Fix inventory variant listing (INVENTORY FIX ONLY)
--
-- Deployed list_admin_variants (000011) failed at runtime with:
--
--   42702: column reference "id" is ambiguous
--          (It could refer to either a PL/pgSQL variable or a table column.)
--
-- Root cause: the function's `returns table(...)` output columns are PL/pgSQL
-- OUT-parameter variables (`id`, `product_id`, `is_active`, ...). The
-- staff-context lookup used unqualified column names:
--
--   select role into v_role
--     from public.staff_members
--    where id = v_actor        -- ambiguous: staff_members.id vs out-param id
--      and is_active = true;   -- ambiguous: staff_members.is_active vs out-param
--
-- PL/pgSQL could not tell the staff_members column from the output variable.
-- get_my_staff_context is unaffected because it aliases the table (s.id).
--
-- Fix: re-create the function qualifying every column reference with table
-- aliases. Signature, return contract, staff authorization, exact-stock
-- privacy, product_variants privacy and EXECUTE grants are UNCHANGED.
-- ---------------------------------------------------------------------------
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
  select s.role into v_role
    from public.staff_members s
   where s.id = v_actor
     and s.is_active = true;

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

-- Re-create drops implicit grants; restore the exact same authorization:
-- EXECUTE for authenticated only. anon/public remain denied, so exact stock
-- stays unreachable outside this RPC.
revoke all on function public.list_admin_variants(uuid) from public, anon, authenticated;
grant execute on function public.list_admin_variants(uuid) to authenticated;
