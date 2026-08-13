-- =============================================================================
-- NOORE · M002 — CUSTOMERS, ADDRESSES, CARTS, WISHLIST
--
-- Row-level safety is enforced centrally in M006 (RLS). This migration defines
-- structure plus the two automatic account-bootstrap triggers.
--
-- AUTH MODEL (locked, Phase 1.2):
-- Auth is DB-authoritative. A `profiles` row is created automatically for every
-- new auth user (email verification required in production). Identity comes from
-- auth.uid() — the database is the single source of truth; JWT claims are never
-- used for authorization decisions.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Profiles (mirror of auth.users — the DB-authoritative identity store)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Bootstrap: create a profile the moment a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Addresses (customer-owned address book)
-- ---------------------------------------------------------------------------
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  full_name   text not null,
  phone       text not null,
  address     text not null,
  city        text not null,
  state       text,
  postal_code text,
  country     text not null default 'PK',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Carts (one active cart per authenticated user)
-- ---------------------------------------------------------------------------
create table public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bootstrap: give every new auth user a cart.
create or replace function public.handle_new_cart()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.carts (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_profiles_created
  after insert on public.profiles
  for each row execute function public.handle_new_cart();

-- ---------------------------------------------------------------------------
-- Cart items (quantities revalidated server-side by create_order in M006;
-- never trust client-supplied prices)
-- ---------------------------------------------------------------------------
create table public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);
create index cart_items_variant_id_idx on public.cart_items (variant_id);

-- ---------------------------------------------------------------------------
-- Wishlist (authenticated customers only)
-- ---------------------------------------------------------------------------
create table public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

create index wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index wishlist_items_variant_id_idx on public.wishlist_items (variant_id);
