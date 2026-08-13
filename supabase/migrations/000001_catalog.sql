-- =============================================================================
-- NOORE · M001 — CATALOG + REFERENCE SCHEMA
--
-- Reference data (categories, colors, sizes), product catalog, variants,
-- images, relations, and the safe storefront availability view.
--
-- Canonical money unit: INTEGER PKR RUPEES (e.g. 1850 = PKR 1,850).
-- Never divide/multiply prices by 100.
--
-- NOTE ON SEEDED STOCK:
-- Real production stock quantities are NOT known yet. All seeded variants use
-- `stock_quantity = 10` as an explicit DEVELOPMENT PLACEHOLDER so the storefront
-- never shows false out-of-stock. This is NOT production inventory. Admin
-- inventory management (Phase 6) will replace these values before launch.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Reference tables
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.colors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  hex         text,
  sort_order  integer not null default 0
);

create table public.sizes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,               -- canonical URL slug
  category_id   uuid not null references public.categories (id) on delete restrict,
  name          text not null,
  description   text,
  fabric        text,
  care          text,
  shipping_info text,
  price         integer not null check (price >= 0), -- integer PKR rupees
  is_active     boolean not null default true,       -- active / draft
  is_featured   boolean not null default false,
  is_new        boolean not null default false,
  is_signature  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_sort_order_idx on public.products (sort_order);

-- ---------------------------------------------------------------------------
-- Variants (SKU-level, variant-aware inventory)
-- ---------------------------------------------------------------------------
create table public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  color_id       uuid not null references public.colors (id) on delete restrict,
  size_id        uuid not null references public.sizes (id) on delete restrict,
  sku            text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (product_id, color_id, size_id)
);

create index product_variants_product_id_idx on public.product_variants (product_id);

-- ---------------------------------------------------------------------------
-- Product images
-- ---------------------------------------------------------------------------
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  -- Path within the `product-images` storage bucket.
  -- NOTE: Phase 2 seeds use the current frontend public asset paths as
  -- PLACEHOLDER references (e.g. '/images/home/...'). Phase 4 will migrate real
  -- imagery into the product-images bucket and update these values.
  storage_path  text not null,
  alt_text      text,
  position      integer not null default 0,
  is_primary    boolean not null default false,
  unique (product_id, position)
);

create index product_images_product_id_idx on public.product_images (product_id);

-- ---------------------------------------------------------------------------
-- Product relations ("Complete the Look")
-- ---------------------------------------------------------------------------
create table public.product_relations (
  product_id         uuid not null references public.products (id) on delete cascade,
  related_product_id uuid not null references public.products (id) on delete cascade,
  primary key (product_id, related_product_id),
  check (product_id <> related_product_id)
);

create index product_relations_related_product_id_idx on public.product_relations (related_product_id);

-- ---------------------------------------------------------------------------
-- Safe storefront availability view
--
-- EXACT stock_quantity must never be exposed to anon/authenticated users.
-- `product_variants` receives NO select grant for browser roles; the storefront
-- consumes this view, which exposes only the boolean availability flag.
-- The view is owner-privileged (security_invoker = false) so it reads the base
-- table with the owner's rights while still hiding the raw count.
-- ---------------------------------------------------------------------------
create view public.storefront_variants
as
select
  pv.id          as id,
  pv.product_id  as product_id,
  pv.color_id    as color_id,
  pv.size_id     as size_id,
  pv.is_active   as is_active,
  (pv.stock_quantity > 0) as is_in_stock
from public.product_variants pv;

-- =============================================================================
-- SEED DATA — derived from lib/catalog-data.ts (canonical source for Phase 2)
-- =============================================================================

insert into public.categories (slug, name, sort_order) values
  ('abayas', 'Abayas', 1),
  ('hijabs', 'Hijabs', 2),
  ('chadars', 'Chadars', 3);

insert into public.colors (name, hex, sort_order) values
  ('Chocolate', '#4B3621', 1),
  ('Black', '#121212', 2),
  ('Taupe', '#A29688', 3),
  ('Dusty Rose', '#E8C1C5', 4),
  ('Brown', '#6F4E37', 5);

insert into public.sizes (name, sort_order) values
  ('S', 1), ('M', 2), ('L', 3), ('XL', 4), ('One Size', 5);

-- Products (name/slug/price/description/fabric/care/shipping/flags match the
-- frozen frontend contract exactly).
insert into public.products
  (slug, category_id, name, description, fabric, care, shipping_info,
   price, is_active, is_featured, is_new, is_signature, sort_order)
select data.slug, c.id, data.name, data.description, data.fabric, data.care,
       data.shipping_info, data.price, true, data.is_featured, data.is_new,
       data.is_signature, data.sort_order
from public.categories c
cross join (
  values
    ('noore-e-haya-abaya', 'abayas', 'Noore-e-Haya Abaya',
     'Elegant chocolate brown abaya with subtle embroidery details.',
     'Premium Crepe', 'Dry clean recommended.',
     'Free shipping on orders over 10,000 PKR.', 12900,
     true, false, true, 1),
    ('luna-abaya', 'abayas', 'Luna Abaya',
     'Classic black abaya with a modern cut.',
     'Nidha', 'Hand wash cold.',
     'Free shipping on orders over 10,000 PKR.', 11500,
     true, false, true, 2),
    ('dusk-embroidered-abaya', 'abayas', 'Dusk Embroidered Abaya',
     'Sophisticated black abaya featuring intricate embroidery.',
     'Georgette', 'Dry clean only.',
     'Free shipping on orders over 10,000 PKR.', 13900,
     true, false, true, 3),
    ('elegance-abaya', 'abayas', 'Elegance Abaya',
     'Minimalist taupe abaya for a timeless look.',
     'Crepe', 'Dry clean recommended.',
     'Free shipping on orders over 10,000 PKR.', 12500,
     true, false, true, 4),
    ('chiffon-hijab', 'hijabs', 'Chiffon Hijab',
     'Lightweight and elegant dusty rose chiffon hijab.',
     'Chiffon', 'Hand wash cold.',
     'Free shipping on orders over 10,000 PKR.', 1850,
     false, true, false, 5),
    ('noore-chadar', 'chadars', 'Noore Chadar',
     'Soft and versatile taupe chadar.',
     'Cotton Blend', 'Machine wash cold.',
     'Free shipping on orders over 10,000 PKR.', 2450,
     false, true, false, 6),
    ('premium-jersey-hijab', 'hijabs', 'Premium Jersey Hijab',
     'Comfortable and breathable black jersey hijab.',
     'Jersey', 'Machine wash cold.',
     'Free shipping on orders over 10,000 PKR.', 1950,
     false, true, false, 7),
    ('linen-abaya', 'abayas', 'Linen Abaya',
     'Breathable linen abaya perfect for warmer days.',
     'Linen', 'Hand wash cold.',
     'Free shipping on orders over 10,000 PKR.', 11900,
     false, true, false, 8)
) as data(slug, category, name, description, fabric, care, shipping_info,
          price, is_featured, is_new, is_signature, sort_order)
where c.slug = data.category;

-- Product images — single placeholder image per product (see note above).
insert into public.product_images (product_id, storage_path, alt_text, position, is_primary)
select p.id, data.path, data.alt, 0, true
from public.products p
cross join (
  values
    ('noore-e-haya-abaya', '/images/home/product-brown-temporary.png',
     'Chocolate brown Noore-e-Haya abaya'),
    ('luna-abaya', '/images/home/product-black-temporary.png', 'Black Luna abaya'),
    ('dusk-embroidered-abaya', '/images/home/product-black-temporary.png', 'Black embroidered Dusk abaya'),
    ('elegance-abaya', '/images/home/product-taupe-temporary.png', 'Taupe Elegance abaya'),
    ('chiffon-hijab', '/images/home/product-rose-temporary.png', 'Dusty rose chiffon hijab'),
    ('noore-chadar', '/images/home/product-taupe-temporary.png', 'Taupe Noore chadar'),
    ('premium-jersey-hijab', '/images/home/product-black-temporary.png', 'Black premium jersey hijab'),
    ('linen-abaya', '/images/home/product-brown-temporary.png', 'Brown linen abaya')
) as data(slug, path, alt)
where p.slug = data.slug;

-- Variants for the currently supported size/color combinations.
-- SKU scheme: NR-<PRODUCTCODE>-<SIZE>-<COLORCODE>  (One Size → OS)
-- Stock: 10 = DEVELOPMENT PLACEHOLDER (see header note).
insert into public.product_variants (product_id, color_id, size_id, sku, stock_quantity, is_active)
select p.id, c.id, s.id, data.sku, 10, true
from public.products p
cross join public.colors c
cross join public.sizes s
cross join (
  values
    ('noore-e-haya-abaya', 'Chocolate', 'S', 'NR-HAYA-S-CHO'),
    ('noore-e-haya-abaya', 'Chocolate', 'M', 'NR-HAYA-M-CHO'),
    ('noore-e-haya-abaya', 'Chocolate', 'L', 'NR-HAYA-L-CHO'),
    ('noore-e-haya-abaya', 'Chocolate', 'XL', 'NR-HAYA-XL-CHO'),
    ('luna-abaya', 'Black', 'S', 'NR-LUNA-S-BLK'),
    ('luna-abaya', 'Black', 'M', 'NR-LUNA-M-BLK'),
    ('luna-abaya', 'Black', 'L', 'NR-LUNA-L-BLK'),
    ('dusk-embroidered-abaya', 'Black', 'M', 'NR-DUSK-M-BLK'),
    ('dusk-embroidered-abaya', 'Black', 'L', 'NR-DUSK-L-BLK'),
    ('elegance-abaya', 'Taupe', 'S', 'NR-ELEGANCE-S-TAU'),
    ('elegance-abaya', 'Taupe', 'M', 'NR-ELEGANCE-M-TAU'),
    ('elegance-abaya', 'Taupe', 'L', 'NR-ELEGANCE-L-TAU'),
    ('elegance-abaya', 'Taupe', 'XL', 'NR-ELEGANCE-XL-TAU'),
    ('chiffon-hijab', 'Dusty Rose', 'One Size', 'NR-CHIFFON-OS-RSE'),
    ('noore-chadar', 'Taupe', 'One Size', 'NR-CHADAR-OS-TAU'),
    ('premium-jersey-hijab', 'Black', 'One Size', 'NR-JERSEY-OS-BLK'),
    ('linen-abaya', 'Brown', 'S', 'NR-LINEN-S-BRN'),
    ('linen-abaya', 'Brown', 'M', 'NR-LINEN-M-BRN'),
    ('linen-abaya', 'Brown', 'L', 'NR-LINEN-L-BRN')
) as data(slug, color, size, sku)
where p.slug = data.slug and c.name = data.color and s.name = data.size;

-- "Complete the Look" relations (from relatedProductIds).
insert into public.product_relations (product_id, related_product_id)
select p.id, r.id
from public.products p
cross join public.products r
cross join (
  values
    ('noore-e-haya-abaya', 'luna-abaya'),
    ('noore-e-haya-abaya', 'dusk-embroidered-abaya'),
    ('luna-abaya', 'noore-e-haya-abaya'),
    ('luna-abaya', 'dusk-embroidered-abaya'),
    ('dusk-embroidered-abaya', 'noore-e-haya-abaya'),
    ('dusk-embroidered-abaya', 'luna-abaya'),
    ('elegance-abaya', 'noore-e-haya-abaya'),
    ('elegance-abaya', 'luna-abaya'),
    ('chiffon-hijab', 'noore-chadar'),
    ('chiffon-hijab', 'premium-jersey-hijab'),
    ('noore-chadar', 'chiffon-hijab'),
    ('noore-chadar', 'premium-jersey-hijab'),
    ('premium-jersey-hijab', 'chiffon-hijab'),
    ('premium-jersey-hijab', 'noore-chadar'),
    ('linen-abaya', 'noore-e-haya-abaya'),
    ('linen-abaya', 'luna-abaya')
) as data(product_slug, related_slug)
where p.slug = data.product_slug and r.slug = data.related_slug;
