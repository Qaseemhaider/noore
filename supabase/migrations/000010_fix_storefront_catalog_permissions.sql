-- =============================================================================
-- NOORE · M010 — FIX Storefront Catalog Permissions (Phase 6 Patch)
--
-- Regression fix: Migration 000009 included `revoke all on table public.categories
-- from anon, authenticated` (and colors/sizes), which removed the SELECT grants
-- that migration 000006 had established for the public storefront catalog.
-- This migration re-applies the minimum SELECT privileges required for anon/authenticated
-- storefront reads, without restoring any browser-write access.
--
-- What this restores:
--   categories, colors, sizes, products, product_images, product_relations,
--   storefront_variants — SELECT for anon + authenticated only.
--
-- What this does NOT restore:
--   product_variants direct SELECT (remains private, stock_quantity hidden)
--   Any INSERT/UPDATE/DELETE on any table
--   service_role-style unrestricted access
--
-- Idempotent: safe to run again (grants are cumulative; re-granting existing
-- grants is harmless). Does not remove or alter RLS policies.
-- =============================================================================

-- ------------------------------------------------------------
-- 1. Restore minimum SELECT privileges for the public storefront catalog.
--    These were inadvertently revoked by migration 000009's
--    `revoke all on table ... from anon, authenticated` statements.
-- ------------------------------------------------------------
grant select on public.categories        to anon, authenticated;
grant select on public.colors            to anon, authenticated;
grant select on public.sizes             to anon, authenticated;
grant select on public.products          to anon, authenticated;
grant select on public.product_images    to anon, authenticated;
grant select on public.product_relations to anon, authenticated;
grant select on public.storefront_variants to anon, authenticated;

-- ------------------------------------------------------------
-- 2. Deliberately NOT granting SELECT on product_variants.
--    Direct browser SELECT of product_variants must remain denied
--    (stock_quantity is never exposed publicly).
--    The only safe variant availability surface is storefront_variants.
-- ------------------------------------------------------------
-- (no grant — keep denied by default)

-- ------------------------------------------------------------
-- 3. Preserve existing RLS policies; do not alter them.
--    RLS is already enabled on all relevant tables via migration 000006,
--    and the select policies above work in conjunction with RLS.
-- ------------------------------------------------------------
-- (no RLS policy changes)

-- ------------------------------------------------------------
-- 4. No browser INSERT/UPDATE/DELETE grants are added.
--    All catalog writes must go through authorized server actions
--    and the hardened RPC functions in migration 000009.
-- ------------------------------------------------------------
-- (no write grants)

-- ===========================================================================
-- Migration 000010 complete. Re-applies the minimum catalog SELECT grants
-- lost through migration 000009's defensive revoke-all pattern. Safe to
-- run again (GRANT IF NOT EXISTS behavior via Supabase default).
-- ===========================================================================