-- =============================================================================
-- NOORE · M006 — RLS, GRANTS, SECURE FUNCTIONS, STORAGE
--
-- This migration is the security layer. Every NOORE table is RLS-protected and
-- the minimum viable grants are applied to `anon` and `authenticated`.
-- Admin operations never run as browser roles: the trusted server uses
-- `service_role` (RLS-bypassing) and SECURITY DEFINER functions.
--
-- PRINCIPLES APPLIED:
--  * Defense in depth: RLS enabled everywhere (even where no browser grants
--    exist, e.g. product_variants, staff_*).
--  * exact stock_quantity is unreadable by anon/authenticated (product_variants
--    has NO select grant); the storefront uses public.storefront_variants.
--  * create_order() is the single atomic checkout entry point, SECURITY DEFINER,
--    owned by the migration role → bypasses RLS under full privilege, validating
--    canonical prices from the DB and rejecting client-supplied pricing.
--  * admin_log() is append-only; executed only by service_role.
--  * Future-proofing: default privileges for anon/authenticated in `public` are
--    revoked so objects created in later phases do NOT auto-expose.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper functions
-- ---------------------------------------------------------------------------
-- 1a. updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1b. Append-only admin audit logging. SECURITY DEFINER so the trusted server
-- can write audit rows without direct table grants; EXECUTE is restricted to
-- service_role below. Never pass secrets in p_data.
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
begin
  insert into public.admin_audit_logs (actor_id, action, entity, entity_id, data)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_data);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. updated_at triggers
-- ---------------------------------------------------------------------------
create trigger products_set_updated_at
  before update on public.products for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at
  before update on public.product_variants for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at
  before update on public.profiles for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at
  before update on public.addresses for each row execute function public.set_updated_at();
create trigger carts_set_updated_at
  before update on public.carts for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at
  before update on public.cart_items for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at
  before update on public.reviews for each row execute function public.set_updated_at();
create trigger orders_set_updated_at
  before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_set_updated_at
  before update on public.payments for each row execute function public.set_updated_at();
create trigger staff_members_set_updated_at
  before update on public.staff_members for each row execute function public.set_updated_at();
create trigger announcements_set_updated_at
  before update on public.announcements for each row execute function public.set_updated_at();
create trigger content_pages_set_updated_at
  before update on public.content_pages for each row execute function public.set_updated_at();
create trigger faq_items_set_updated_at
  before update on public.faq_items for each row execute function public.set_updated_at();
create trigger page_seo_set_updated_at
  before update on public.page_seo for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at
  before update on public.site_settings for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS enablement on every NOORE table
-- ---------------------------------------------------------------------------
alter table public.categories                 enable row level security;
alter table public.colors                      enable row level security;
alter table public.sizes                       enable row level security;
alter table public.products                    enable row level security;
alter table public.product_variants            enable row level security;
alter table public.product_images              enable row level security;
alter table public.product_relations           enable row level security;
alter table public.profiles                    enable row level security;
alter table public.addresses                   enable row level security;
alter table public.carts                       enable row level security;
alter table public.cart_items                  enable row level security;
alter table public.wishlist_items              enable row level security;
alter table public.reviews                     enable row level security;
alter table public.review_images               enable row level security;
alter table public.shipping_methods            enable row level security;
alter table public.orders                      enable row level security;
alter table public.order_items                 enable row level security;
alter table public.order_addresses             enable row level security;
alter table public.order_status_history        enable row level security;
alter table public.payments                    enable row level security;
alter table public.contact_messages            enable row level security;
alter table public.newsletter_subscribers      enable row level security;
alter table public.staff_members               enable row level security;
alter table public.staff_invites               enable row level security;
alter table public.admin_audit_logs            enable row level security;
alter table public.site_settings               enable row level security;
alter table public.announcements               enable row level security;
alter table public.content_pages               enable row level security;
alter table public.faq_items                   enable row level security;
alter table public.page_seo                    enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Revoke default superset, then grant the minimum.
--
-- NOTE: Supabase's default privileges auto-grant ALL on new `public` objects to
-- anon/authenticated. M001–M005 objects already received that grant, so we revoke
-- here and re-grant only what each role actually needs. service_role keeps its
-- default ALL (trusted server). Default privileges are revoked below so future
-- objects do not auto-expose.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public    from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
revoke all on all routines in schema public  from anon, authenticated;

alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on tables    from authenticated;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on sequences from authenticated;
alter default privileges in schema public revoke all on functions from anon;
alter default privileges in schema public revoke all on functions from authenticated;
alter default privileges in schema public revoke all on routines  from anon;
alter default privileges in schema public revoke all on routines  from authenticated;

grant usage on schema public to anon, authenticated;

-- --- Public catalog reads (anon + authenticated) -----------------------------
grant select on public.categories        to anon, authenticated;
grant select on public.colors            to anon, authenticated;
grant select on public.sizes             to anon, authenticated;
grant select on public.products          to anon, authenticated;
grant select on public.product_images    to anon, authenticated;
grant select on public.product_relations to anon, authenticated;
grant select on public.storefront_variants to anon, authenticated;
grant select on public.shipping_methods  to anon, authenticated;
grant select on public.site_settings     to anon, authenticated;
grant select on public.announcements     to anon, authenticated;
grant select on public.content_pages     to anon, authenticated;
grant select on public.faq_items         to anon, authenticated;
grant select on public.page_seo          to anon, authenticated;

-- --- Own-row customer data (authenticated only) ------------------------------
grant select, update                     on public.profiles            to authenticated;
grant select, insert, update, delete     on public.addresses           to authenticated;
grant select, update                     on public.carts               to authenticated;
grant select, insert, update, delete     on public.cart_items          to authenticated;
grant select, insert, delete             on public.wishlist_items      to authenticated;
grant select                             on public.reviews             to anon, authenticated;
grant insert, update, delete             on public.reviews             to authenticated;
grant select                             on public.review_images       to anon, authenticated;
grant insert                             on public.review_images       to authenticated;
grant select                             on public.orders              to authenticated;
grant select                             on public.order_items         to authenticated;
grant select                             on public.order_addresses     to authenticated;
grant select                             on public.order_status_history to authenticated;
grant select                             on public.payments            to authenticated;

-- --- Public form submissions (anon + authenticated) --------------------------
grant insert on public.contact_messages       to anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;

-- --- NO browser grants at all: -----------------------------------------------
-- product_variants (exact stock hidden), staff_members, staff_invites,
-- admin_audit_logs (service_role / SECURITY DEFINER only).

-- ---------------------------------------------------------------------------
-- 5. Row-level security policies
-- ---------------------------------------------------------------------------
-- 5a. Public catalog (anon + authenticated)
create policy "catalog_select" on public.categories
  for select to anon, authenticated using (true);
create policy "colors_select" on public.colors
  for select to anon, authenticated using (true);
create policy "sizes_select" on public.sizes
  for select to anon, authenticated using (true);
create policy "products_select_active" on public.products
  for select to anon, authenticated using (is_active = true);
create policy "product_images_select_products" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  );
create policy "product_relations_select" on public.product_relations
  for select to anon, authenticated using (true);
create policy "shipping_methods_select" on public.shipping_methods
  for select to anon, authenticated using (is_active = true);
create policy "site_settings_select" on public.site_settings
  for select to anon, authenticated using (true);
create policy "announcements_select_live" on public.announcements
  for select to anon, authenticated using (
    is_active = true
    and (start_at is null or start_at <= now())
    and (end_at is null or end_at > now())
  );
create policy "content_pages_select_published" on public.content_pages
  for select to anon, authenticated using (is_published = true);
create policy "faq_items_select_active" on public.faq_items
  for select to anon, authenticated using (is_active = true);
create policy "page_seo_select" on public.page_seo
  for select to anon, authenticated using (true);

-- 5b. Own-row customer data
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "addresses_select_own" on public.addresses
  for select to authenticated using (user_id = auth.uid());
create policy "addresses_insert_own" on public.addresses
  for insert to authenticated with check (user_id = auth.uid());
create policy "addresses_update_own" on public.addresses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_delete_own" on public.addresses
  for delete to authenticated using (user_id = auth.uid());

create policy "carts_select_own" on public.carts
  for select to authenticated using (user_id = auth.uid());
create policy "carts_update_own" on public.carts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cart_items_select_own" on public.cart_items
  for select to authenticated using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_insert_own" on public.cart_items
  for insert to authenticated with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_update_own" on public.cart_items
  for update to authenticated using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_delete_own" on public.cart_items
  for delete to authenticated using (
    exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
  );

create policy "wishlist_select_own" on public.wishlist_items
  for select to authenticated using (user_id = auth.uid());
create policy "wishlist_insert_own" on public.wishlist_items
  for insert to authenticated with check (user_id = auth.uid());
create policy "wishlist_delete_own" on public.wishlist_items
  for delete to authenticated using (user_id = auth.uid());

-- Reviews: approved are public; owners may manage their own.
create policy "reviews_select_approved_or_own" on public.reviews
  for select to anon, authenticated using (
    status = 'approved' or (auth.uid() is not null and user_id = auth.uid())
  );
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated with check (user_id = auth.uid());
create policy "reviews_update_own_pending" on public.reviews
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using (user_id = auth.uid());

-- Review images: readable only when tied to an approved review; uploadable by
-- the review author (PRIVATE bucket storage handles the actual file access).
create policy "review_images_select_approved" on public.review_images
  for select to anon, authenticated using (
    exists (select 1 from public.reviews r where r.id = review_id and r.status = 'approved')
  );
create policy "review_images_insert_own" on public.review_images
  for insert to authenticated with check (
    exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
  );

-- Orders & children: authenticated customers may read their own; writes flow
-- exclusively through create_order() (service_role) and admin tooling.
create policy "orders_select_own" on public.orders
  for select to authenticated using (user_id = auth.uid());
create policy "order_items_select_own" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "order_addresses_select_own" on public.order_addresses
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "order_status_history_select_own" on public.order_status_history
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "payments_select_own" on public.payments
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- 5c. Public form submissions (insert-only)
create policy "contact_messages_insert" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "newsletter_subscribers_insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

-- 5d. No-policy tables (deny-all for browser roles; service_role / DEFINER
--     functions handle all access):
--     product_variants, staff_members, staff_invites, admin_audit_logs.

-- ---------------------------------------------------------------------------
-- 6. create_order — the single atomic checkout entry point
-- ---------------------------------------------------------------------------
-- Security model:
--  * SECURITY DEFINER (owned by the migration role) → runs as the table owner,
--    bypassing RLS with full rights; row locks + stock decrement are atomic.
--  * `set search_path = ''` + fully qualified names defeat search-path hijacks.
--  * Client-submitted prices, totals, statuses and user identity are NEVER
--    trusted; canonical prices come from public.products and the shipping fee
--    from public.shipping_methods.
--  * The checkout route (server, service_role only) supplies p_user_id from its
--    own auth verification — browser roles cannot execute this function at all.
--  * idempotency_key makes retried checkouts no-ops.
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
  v_idx          integer;
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

-- ---------------------------------------------------------------------------
-- 7. Function grants (browser roles get nothing; service_role only)
-- ---------------------------------------------------------------------------
revoke execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) from anon, authenticated;
revoke execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) from public;
revoke execute on function public.admin_log(text, text, uuid, jsonb) from anon, authenticated;
revoke execute on function public.admin_log(text, text, uuid, jsonb) from public;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_cart() from anon, authenticated;
revoke execute on function public.handle_new_cart() from public;

grant execute on function public.create_order(uuid[], integer[], text, text, jsonb, text, uuid, uuid) to service_role;
grant execute on function public.admin_log(text, text, uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 8. Storage buckets + policies
-- ---------------------------------------------------------------------------
--  * product-images  → PUBLIC (product photography; server writes only)
--  * review-images   → PRIVATE (customer uploads to their own folder; served
--                      later only for approved reviews via server re-hosting)
--  * cms-images      → PUBLIC (admin CMS media; server writes only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('review-images', 'review-images', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('cms-images', 'cms-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "noore_public_read_product_images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "noore_public_read_cms_images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'cms-images');

-- review-images: customers may only touch their own folder ({uid}/...).
create policy "noore_owner_insert_review_images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "noore_owner_update_review_images" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "noore_owner_delete_review_images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
