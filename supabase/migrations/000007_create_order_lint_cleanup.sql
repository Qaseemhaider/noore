-- =============================================================================
-- NOORE · M007 — create_order lint cleanup
--
-- Removes the redundant `v_idx integer;` declaration from public.create_order.
-- The FOR ... IN loops implicitly declare their own loop variable, so the
-- explicit declaration only produced plpgsql "shadowed/unused variable"
-- warnings with no functional change. Rewrites the function identically.
-- =============================================================================
create or replace function public.create_order(
  p_variant_ids uuid[],
  p_quantities integer[],
  p_shipping_method text,
  p_email text,
  p_address jsonb,
  p_payment_method text,
  p_idempotency_key uuid,
  p_user_id uuid default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order        public.orders;
  v_shipping     public.shipping_methods;
  v_item         record;
  v_cart_id      uuid;
  v_subtotal     integer := 0;
  v_total        integer;
  v_order_number text;
begin
  -- Idempotency: a retry with the same key returns the already-created order.
  select * into v_order
  from public.orders
  where idempotency_key = p_idempotency_key;
  if found then
    return v_order;
  end if;

  -- Input validation.
  if p_variant_ids is null or array_length(p_variant_ids, 1) = 0 then
    raise exception 'NOORE_EMPTY_ORDER';
  end if;
  if array_length(p_variant_ids, 1) <> array_length(p_quantities, 1) then
    raise exception 'NOORE_INPUT_MISMATCH';
  end if;
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'NOORE_INVALID_EMAIL';
  end if;
  if p_address is null or p_address->>'full_name' is null
     or p_address->>'phone' is null or p_address->>'address' is null
     or p_address->>'city' is null then
    raise exception 'NOORE_INVALID_ADDRESS';
  end if;
  if p_payment_method not in ('cod', 'card') then
    raise exception 'NOORE_INVALID_PAYMENT_METHOD';
  end if;
  if p_payment_method = 'card' then
    -- Card processing arrives with the payment gateway integration (Phase 4).
    raise exception 'NOORE_CARD_PAYMENTS_COMING_SOON';
  end if;

  select * into v_shipping
  from public.shipping_methods
  where id = p_shipping_method and is_active = true;
  if not found then
    raise exception 'NOORE_INVALID_SHIPPING_METHOD';
  end if;

  -- Reject duplicate variants in the request.
  if exists (
    select 1
    from unnest(p_variant_ids) as u(id)
    group by u.id
    having count(*) > 1
  ) then
    raise exception 'NOORE_DUPLICATE_VARIANT';
  end if;

  -- Lock, validate and price every line (canonical prices from the DB).
  for v_idx in 1 .. array_length(p_variant_ids, 1) loop
    select pv.stock_quantity, pv.is_active, pv.product_id
      into v_item
      from public.product_variants pv
      where pv.id = p_variant_ids[v_idx]
      for update;

    if not found then
      raise exception 'NOORE_VARIANT_NOT_FOUND';
    end if;
    if not v_item.is_active then
      raise exception 'NOORE_VARIANT_INACTIVE';
    end if;
    if p_quantities[v_idx] <= 0 then
      raise exception 'NOORE_INVALID_QUANTITY';
    end if;
    if v_item.stock_quantity < p_quantities[v_idx] then
      raise exception 'NOORE_OUT_OF_STOCK';
    end if;

    select p.price
      into v_item
      from public.products p
      where p.id = v_item.product_id and p.is_active = true;

    if not found then
      raise exception 'NOORE_PRODUCT_INACTIVE';
    end if;

    v_subtotal := v_subtotal + (v_item.price * p_quantities[v_idx]);
  end loop;

  -- Shipping fee: NULL means "not yet configured" (standard below 10k PKR was
  -- intentionally left undecided in Phase 1.2) → refuse the order rather than
  -- silently charging an unconfigured amount.
  if v_shipping.fee is null then
    raise exception 'NOORE_SHIPPING_FEE_UNCONFIGURED';
  end if;
  v_total := v_subtotal + v_shipping.fee;

  v_order_number := 'NOORE-' || nextval('public.order_number_seq');

  -- Decrement stock (rows are already locked above — atomic).
  for v_idx in 1 .. array_length(p_variant_ids, 1) loop
    update public.product_variants
       set stock_quantity = stock_quantity - p_quantities[v_idx]
     where id = p_variant_ids[v_idx];
  end loop;

  insert into public.orders
    (order_number, user_id, status, payment_method, payment_status,
     subtotal, shipping_fee, total, email, phone, idempotency_key)
  values
    (v_order_number, p_user_id, 'pending', p_payment_method, 'unpaid',
     v_subtotal, v_shipping.fee, v_total, p_email, p_address->>'phone',
     p_idempotency_key)
  returning * into v_order;

  for v_idx in 1 .. array_length(p_variant_ids, 1) loop
    select pv.sku, pv.product_id, p.name as product_name,
           c.name as color_name, s.name as size_name, p.price as unit_price
      into v_item
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    join public.colors c on c.id = pv.color_id
    join public.sizes s on s.id = pv.size_id
    where pv.id = p_variant_ids[v_idx];

    insert into public.order_items
      (order_id, product_id, variant_id, product_name, sku, color_name,
       size_name, unit_price, quantity, line_total)
    values
      (v_order.id, v_item.product_id, p_variant_ids[v_idx], v_item.product_name,
       v_item.sku, v_item.color_name, v_item.size_name, v_item.unit_price,
       p_quantities[v_idx], v_item.unit_price * p_quantities[v_idx]);
  end loop;

  insert into public.order_addresses
    (order_id, full_name, phone, address, city, state, postal_code, country)
  values
    (v_order.id,
     p_address->>'full_name', p_address->>'phone', p_address->>'address',
     p_address->>'city', p_address->>'state', p_address->>'postal_code',
     coalesce(p_address->>'country', 'PK'));

  insert into public.order_status_history (order_id, status, note, changed_by)
  values (v_order.id, 'pending', 'Order placed', p_user_id);

  insert into public.payments (order_id, method, status, amount)
  values (v_order.id, p_payment_method, 'pending', v_total);

  -- Clear the authenticated customer's cart (guest carts never exist).
  if p_user_id is not null then
    select id into v_cart_id from public.carts where user_id = p_user_id;
    if found then
      delete from public.cart_items where cart_id = v_cart_id;
    end if;
  end if;

  return v_order;
end;
$$;

-- Re-assert the execution grant (CREATE OR REPLACE preserves the prior grants,
-- but this keeps the invariant explicit and self-contained).
revoke execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) from anon, authenticated;
revoke execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) from public;
grant execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) to service_role;
