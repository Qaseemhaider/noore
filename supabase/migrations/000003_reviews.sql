-- =============================================================================
-- NOORE · M003 — REVIEWS
--
-- REVIEW MODEL (locked, Phase 1.2):
--  * Only authenticated users can submit (guest reviewers are not supported).
--  * New reviews start in `pending` state.
--  * A verified customer (delivered order for the product) can earn the
--    VERIFIED badge once a review is approved.
--  * Only `approved` reviews are ever served to the storefront.
--
-- Storefront stock hiding applies elsewhere (M001 view); reviews live on
-- products, not variants, so no stock exposure risk here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  user_id          uuid references public.profiles (id) on delete cascade, -- null → reviewer deleted
  rating           integer not null check (rating between 1 and 5),
  title            text,
  body             text not null,
  -- Snapshot of the reviewer's display name at submission time. Stored directly
  -- on the review so the storefront never needs SELECT access to public.profiles
  -- (which stays strictly own-row only).
  reviewer_name    text,
  status           text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  is_verified      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- One review per customer per product (authenticated users always have a
  -- non-null user_id, so partial-unique-index concerns do not apply).
  unique (user_id, product_id)
);

create index reviews_product_id_status_idx on public.reviews (product_id, status);
create index reviews_user_id_idx on public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- Review images (PRIVATE bucket — never publicly readable)
-- ---------------------------------------------------------------------------
create table public.review_images (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  -- Path within the PRIVATE `review-images` bucket: review-images/{uid}/...
  storage_path text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  unique (review_id, position)
);

create index review_images_review_id_idx on public.review_images (review_id);
