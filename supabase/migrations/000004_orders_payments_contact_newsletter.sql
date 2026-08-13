-- =============================================================================
-- NOORE · M004 — SHIPPING, ORDERS, PAYMENTS, CONTACT, NEWSLETTER
--
-- ORDER MODEL (locked, Phase 1.2):
--  * Guest checkout IS supported → orders may have no user_id.
--  * Order statuses: pending → confirmed → processing → shipped → delivered
--                     any state (before shipped) → cancelled
--  * Payments: COD is supported; card-on-file is Phase 4 via server SDK —
--    cards are NEVER stored by us.
--  * Prices are snapshotted at order time and canonicalized inside the
--    SECURITY DEFINER create_order function (M006). The client's submitted
--    prices/totals are never trusted.
--  * `idempotency_key` guarantees a retried checkout cannot double-charge or
--    double-create.
--
-- SHIPPING MODEL:
--  * Standard shipping below PKR 10,000 was NOT yet decided (Phase 4), so
--    shipping_methods.fee is NULLABLE — NULL means "unconfigured". create_order
--    will reject a method whose fee is still NULL whenever the order requires a
--    fee (Phase 4 will decide free-above-threshold and set the value).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Shipping methods (fee NULL = unconfigured, see header note)
-- ---------------------------------------------------------------------------
create table public.shipping_methods (
  id         text primary key,               -- e.g. 'standard', 'express'
  name       text not null,
  fee        integer check (fee is null or fee >= 0),
  free_above integer check (free_above is null or free_above >= 0), -- PKR threshold, null = no free tier
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.shipping_methods (id, name, fee, free_above, is_active, sort_order) values
  ('standard', 'Standard Shipping', null, 10000, true, 1),
  ('express', 'Express Shipping', 500, null, true, 2);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq start 100001;

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,   -- human-facing, from order_number_seq
  user_id          uuid references public.profiles (id) on delete set null, -- null = guest
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'processing',
                                     'shipped', 'delivered', 'cancelled')),
  payment_method   text not null check (payment_method in ('cod', 'card')),
  payment_status   text not null default 'unpaid'
                   check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  subtotal         integer not null check (subtotal >= 0),
  shipping_fee     integer not null check (shipping_fee >= 0),
  total            integer not null check (total >= 0), -- subtotal + shipping_fee
  email            text not null,                       -- always captured (guests too)
  phone            text,
  idempotency_key  uuid not null unique,                -- prevents double-checkout
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (email);
create index orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- Order items (price/name snapshots — immutable after creation)
-- ---------------------------------------------------------------------------
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_name  text not null,
  sku           text not null,
  color_name    text not null,
  size_name     text not null,
  unit_price    integer not null check (unit_price >= 0),
  quantity      integer not null check (quantity > 0),
  line_total    integer not null check (line_total >= 0), -- unit_price * quantity
  unique (order_id, variant_id)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Order shipping snapshot (immutable copy of the submitted address)
-- ---------------------------------------------------------------------------
create table public.order_addresses (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references public.orders (id) on delete cascade,
  full_name   text not null,
  phone       text not null,
  address     text not null,
  city        text not null,
  state       text,
  postal_code text,
  country     text not null default 'PK'
);

-- ---------------------------------------------------------------------------
-- Order status history (append-only audit trail)
-- ---------------------------------------------------------------------------
create table public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      text not null check (status in ('pending', 'confirmed', 'processing',
                                              'shipped', 'delivered', 'cancelled')),
  note        text,
  changed_by  uuid references public.profiles (id) on delete set null, -- null = system/guest
  created_at  timestamptz not null default now()
);

create index order_status_history_order_id_idx on public.order_status_history (order_id);

-- ---------------------------------------------------------------------------
-- Payments (Phase 4 will extend for card transactions)
-- ---------------------------------------------------------------------------
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete restrict,
  method         text not null check (method in ('cod', 'card')),
  status         text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount         integer not null check (amount >= 0),
  gateway_ref    text,                       -- external transaction reference
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);

-- ---------------------------------------------------------------------------
-- Contact messages (public form → admin inbox)
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  status     text not null default 'new'
             check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index contact_messages_status_created_at_idx on public.contact_messages (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Newsletter subscribers (double opt-in tracked, one row per email)
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  status       text not null default 'subscribed'
               check (status in ('subscribed', 'unsubscribed')),
  created_at   timestamptz not null default now()
);
