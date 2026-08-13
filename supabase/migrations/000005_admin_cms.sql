-- =============================================================================
-- NOORE · M005 — ADMIN & CMS
--
-- ADMIN MODEL (locked, Phase 1.2):
--  * Roles: owner > store_manager > seo_editor > support (all can log in via the
--    single /admin shell; capability checks are role-based).
--  * Staff identity is a join of auth.users (DB-authoritative) + staff_members.
--    Authorization = auth.get_user() → staff_members row → is_active → role.
--    JWT claims are NEVER used for authorization. (See M006 for the helper.)
--  * The one-time OWNER BOOTSTRAP runs in Phase 5 (first /admin signup claim).
--  * AAL2 (TOTP MFA) is enforced for sensitive admin actions (Phase 5/7).
--
-- CMS MODEL (locked, Phase 1.2):
--  * Structured content blocks (typed JSONB) — never raw HTML or rich text.
--  * content_pages.blocks stores typed arrays; faq_items are row-based.
--  * Announcements: multiple, scheduled (start_at/end_at), render newest first.
--  * site_settings = single-row key/value store for global content.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------
create table public.staff_members (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  display_name text,
  role       text not null default 'support'
             check (role in ('owner', 'store_manager', 'seo_editor', 'support')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Staff invites (pending invitations to join the admin)
-- ---------------------------------------------------------------------------
create table public.staff_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text not null check (role in ('store_manager', 'seo_editor', 'support')),
  token_hash  text not null unique,
  invited_by  uuid references public.staff_members (id) on delete set null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index staff_invites_email_idx on public.staff_invites (email);

-- ---------------------------------------------------------------------------
-- Admin audit log (append-only; written via the admin_log function in M006)
-- ---------------------------------------------------------------------------
create table public.admin_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,   -- e.g. 'product.update', 'order.status_change'
  entity     text,            -- table name
  entity_id  uuid,            -- affected row
  data       jsonb,           -- before/after summary (never secrets)
  created_at timestamptz not null default now()
);

create index admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index admin_audit_logs_actor_id_idx on public.admin_audit_logs (actor_id);
create index admin_audit_logs_action_idx on public.admin_audit_logs (action);

-- ---------------------------------------------------------------------------
-- Site settings (single-row store for global content)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,           -- e.g. 'contact_email', 'free_shipping_threshold'
  value      jsonb not null,
  updated_by uuid references public.staff_members (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Announcements (multiple, scheduled)
-- ---------------------------------------------------------------------------
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  message    text not null,
  link       text,
  start_at   timestamptz,
  end_at     timestamptz,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_active_window_idx on public.announcements (is_active, start_at, end_at);

-- ---------------------------------------------------------------------------
-- Content pages (structured blocks, not raw HTML)
-- ---------------------------------------------------------------------------
create table public.content_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  -- Typed structured content blocks. Example block shapes (always validated by
  -- server-side zod schema before insert; Phase 8 admin implements the editor):
  --   { type: 'heading', level: 2, text: '...' }
  --   { type: 'paragraph', text: '...' }
  --   { type: 'image', storage_path: 'cms-images/...', alt: '...' }
  --   { type: 'list', items: ['...', '...'], ordered: false }
  blocks      jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  is_published boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FAQ items (row-based content)
-- ---------------------------------------------------------------------------
create table public.faq_items (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Page SEO (per-page metadata, primarily for content pages)
-- ---------------------------------------------------------------------------
create table public.page_seo (
  id            uuid primary key default gen_random_uuid(),
  page_slug     text not null unique,   -- matches content_pages.slug or a route slug
  title         text,
  description   text,
  canonical_url text,
  og_image      text,                   -- storage path or absolute URL
  no_index      boolean not null default false,
  updated_at    timestamptz not null default now()
);
