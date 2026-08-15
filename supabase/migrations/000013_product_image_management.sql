-- =============================================================================
-- NOORE · M013 — PRODUCT IMAGE MANAGEMENT (Phase 6 Fix)
--
-- Implements secure admin product-image management end to end:
--   1. Staff SELECT policy for product_images (additive). M006's
--      `product_images_select_products` only exposes images whose product is
--      ACTIVE, so the admin could not see — and therefore manage — the images
--      of a deactivated product. This additive policy lets active staff with
--      catalog.view read every product's images; anonymous/public behavior is
--      unchanged (still active products only).
--   2. Storage write policies for the `product-images` bucket (insert/update/
--      delete) gated on a new `is_catalog_editor()` helper (owner or store
--      manager). Public reads of the bucket are unchanged (M006).
--   3. product_images write functions (SECURITY DEFINER): add, set alt,
--      set primary, move (reorder), delete. All require OWNER or STORE_MANAGER
--      with AAL2 (sensitive product-editing path), mirroring update_product.
--      The delete function returns the storage_path so the caller can also
--      remove the backing object from Storage.
--
-- No existing policy, function or grant is removed or altered. Idempotent
-- (CREATE OR REPLACE; storage policies use the "if not exists" guard where
-- supported — storage policies are created via `create policy` and are NOT
-- idempotent, so each has a fixed name that only exists once in the file).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Staff catalog editor helper — the write gate for product imagery.
--    Returns true only for ACTIVE staff with role owner or store_manager.
--    SECURITY DEFINER so staff_members (RLS-on, zero grants) can be read; the
--    caller can never read the row, only the boolean verdict.
--    Granted to anon + authenticated so storage policy expressions can call it
--    without permission errors (it only ever returns a boolean; no data leak).
-- ---------------------------------------------------------------------------
create or replace function public.is_catalog_editor()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.staff_members s
     where s.id = auth.uid()
       and s.is_active = true
       and s.role in ('owner', 'store_manager')
  );
$$;

revoke all on function public.is_catalog_editor() from public;
grant execute on function public.is_catalog_editor() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. Staff SELECT policy on product_images (additive with M006's
--    product_images_select_products). Anonymous and non-staff behavior is
--    unchanged: they still only see images of ACTIVE products.
-- ---------------------------------------------------------------------------
create policy "product_images_select_staff" on public.product_images
  for select to authenticated
  using (public.is_catalog_admin());

-- ---------------------------------------------------------------------------
-- 2. Storage write policies for the `product-images` bucket (staff editors).
--    The bucket is PUBLIC for reads (M006); only staff editors may insert,
--    update or delete objects. File size + MIME limits remain enforced by the
--    bucket (5242880 bytes; jpeg/png/webp) and re-checked in the server action.
-- ---------------------------------------------------------------------------
create policy "noore_staff_insert_product_images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'product-images' and public.is_catalog_editor()
  );

create policy "noore_staff_update_product_images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_catalog_editor())
  with check (bucket_id = 'product-images' and public.is_catalog_editor());

create policy "noore_staff_delete_product_images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'product-images' and public.is_catalog_editor()
  );

-- ---------------------------------------------------------------------------
-- 3. product_images write functions
--
-- Security matrix:
--   * product_image_add      -> OWNER or STORE_MANAGER + AAL2
--   * product_image_set_alt  -> OWNER or STORE_MANAGER + AAL2
--   * product_image_set_primary -> OWNER or STORE_MANAGER + AAL2
--   * product_image_move     -> OWNER or STORE_MANAGER + AAL2
--   * product_image_delete   -> OWNER or STORE_MANAGER + AAL2
--
-- MFA/AAL2 is verified from the validated session JWT (`auth.jwt() ->> 'aal'`),
-- never from browser-supplied claims. storage_path must match the server-only
-- generated pattern `{product-uuid}/{object-uuid}.{jpg|jpeg|png|webp}`; no
-- user-controlled paths are ever accepted.
-- ===========================================================================

-- ------------------------------------------------------------
-- 3.1 Add an image record (call AFTER uploading the object to storage).
--     Auto-assigns the next position; the first image becomes primary.
--     Returns the new product_images id.
-- ------------------------------------------------------------
create or replace function public.product_image_add(
  p_product_id   uuid,
  p_storage_path text,
  p_alt_text     text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor    uuid := auth.uid();
  v_role     text;
  v_position integer;
  v_is_first boolean;
  v_id       uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may manage product images';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'product not found';
  end if;

  if p_storage_path is null
     or not (p_storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$') then
    raise exception 'invalid storage path';
  end if;

  select coalesce(max(position) + 1, 0)
    into v_position
    from public.product_images
   where product_id = p_product_id;

  select not exists (
    select 1 from public.product_images where product_id = p_product_id
  ) into v_is_first;

  insert into public.product_images (product_id, storage_path, alt_text, position, is_primary)
  values (p_product_id, p_storage_path, nullif(trim(coalesce(p_alt_text, '')), ''), v_position, v_is_first)
  returning id into v_id;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_IMAGE_ADDED', 'product_images', v_id,
    jsonb_build_object('product_id', p_product_id, 'storage_path', p_storage_path, 'position', v_position));

  return v_id;
end;
$$;

revoke all on function public.product_image_add(uuid, text, text) from public, anon, authenticated;
grant execute on function public.product_image_add(uuid, text, text) to authenticated;

-- ------------------------------------------------------------
-- 3.2 Set the alt text on an image.
-- ------------------------------------------------------------
create or replace function public.product_image_set_alt(
  p_image_id uuid,
  p_alt_text text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_role  text;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may manage product images';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  if not exists (select 1 from public.product_images where id = p_image_id) then
    raise exception 'image not found';
  end if;

  if p_alt_text is not null and length(p_alt_text) > 300 then
    raise exception 'alt text is too long';
  end if;

  update public.product_images
     set alt_text = nullif(trim(coalesce(p_alt_text, '')), '')
   where id = p_image_id;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_IMAGE_ALT_UPDATED', 'product_images', p_image_id,
    jsonb_build_object('alt_text', nullif(trim(coalesce(p_alt_text, '')), '')));

  return 'alt_updated';
end;
$$;

revoke all on function public.product_image_set_alt(uuid, text) from public, anon, authenticated;
grant execute on function public.product_image_set_alt(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- 3.3 Set a single primary image for the product.
--     Clears is_primary on every other image of the same product.
-- ------------------------------------------------------------
create or replace function public.product_image_set_primary(
  p_image_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor   uuid := auth.uid();
  v_role    text;
  v_product uuid;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may manage product images';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  select product_id into v_product
    from public.product_images
   where id = p_image_id;

  if v_product is null then
    raise exception 'image not found';
  end if;

  update public.product_images
     set is_primary = (id = p_image_id)
   where product_id = v_product;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_IMAGE_PRIMARY_SET', 'product_images', p_image_id,
    jsonb_build_object('product_id', v_product));

  return 'primary_set';
end;
$$;

revoke all on function public.product_image_set_primary(uuid) from public, anon, authenticated;
grant execute on function public.product_image_set_primary(uuid) to authenticated;

-- ------------------------------------------------------------
-- 3.4 Move an image up or down within its product's ordering.
--     Swaps positions with the adjacent image ('up' or 'down'). Returns
--     'moved' or 'no_change' when already at the edge.
-- ------------------------------------------------------------
create or replace function public.product_image_move(
  p_image_id  uuid,
  p_direction text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor         uuid := auth.uid();
  v_role          text;
  v_product       uuid;
  v_cur           integer;
  v_neighbor_id   uuid;
  v_neighbor_pos  integer;
  v_swap          integer;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may manage product images';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  select product_id, position into v_product, v_cur
    from public.product_images
   where id = p_image_id;

  if v_product is null then
    raise exception 'image not found';
  end if;

  if p_direction = 'up' then
    select id, position into v_neighbor_id, v_neighbor_pos
      from public.product_images
     where product_id = v_product and position < v_cur
     order by position desc
     limit 1;
  elsif p_direction = 'down' then
    select id, position into v_neighbor_id, v_neighbor_pos
      from public.product_images
     where product_id = v_product and position > v_cur
     order by position asc
     limit 1;
  else
    raise exception 'invalid direction';
  end if;

  if v_neighbor_id is null then
    return 'no_change';
  end if;

  -- Swap positions without tripping unique(product_id, position): park the
  -- moving row at a free slot strictly below the product's minimum.
  v_swap := (select min(position) - 1 from public.product_images where product_id = v_product);

  update public.product_images set position = v_swap      where id = p_image_id;
  update public.product_images set position = v_cur       where id = v_neighbor_id;
  update public.product_images set position = v_neighbor_pos where id = p_image_id;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_IMAGE_REORDERED', 'product_images', p_image_id,
    jsonb_build_object('product_id', v_product, 'direction', p_direction));

  return 'moved';
end;
$$;

revoke all on function public.product_image_move(uuid, text) from public, anon, authenticated;
grant execute on function public.product_image_move(uuid, text) to authenticated;

-- ------------------------------------------------------------
-- 3.5 Delete an image record and return its storage_path so the caller can
--     also remove the backing object from Storage. If the deleted image was
--     the primary, the lowest-position remaining image is promoted.
-- ------------------------------------------------------------
create or replace function public.product_image_delete(
  p_image_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor        uuid := auth.uid();
  v_role         text;
  v_product      uuid;
  v_path         text;
  v_was_primary  boolean;
begin
  select role into v_role
    from public.staff_members
   where id = v_actor
     and is_active = true;

  if v_role is null then
    raise exception 'not authorized';
  end if;

  if not (v_role = 'owner' or v_role = 'store_manager') then
    raise exception 'only the owner or store manager may manage product images';
  end if;

  if (auth.jwt() ->> 'aal') <> 'aal2' then
    raise exception 'mfa (aal2) required';
  end if;

  select product_id, storage_path, is_primary into v_product, v_path, v_was_primary
    from public.product_images
   where id = p_image_id;

  if v_product is null then
    raise exception 'image not found';
  end if;

  delete from public.product_images where id = p_image_id;

  if v_was_primary then
    update public.product_images set is_primary = true
      where id = (
        select id from public.product_images
         where product_id = v_product
         order by position asc
         limit 1
      );
  end if;

  insert into public.admin_audit_logs (actor_id, role_snapshot, action, entity, entity_id, data)
  values (v_actor, v_role, 'PRODUCT_IMAGE_REMOVED', 'product_images', p_image_id,
    jsonb_build_object('product_id', v_product, 'storage_path', v_path));

  return v_path;
end;
$$;

revoke all on function public.product_image_delete(uuid) from public, anon, authenticated;
grant execute on function public.product_image_delete(uuid) to authenticated;

-- ===========================================================================
-- Migration 000013 complete. All functions are SECURITY DEFINER with
-- search_path='', fully qualified objects, and restrictive EXECUTE grants.
-- Storage writes are limited to active catalog editors; public bucket reads
-- and storefront visibility rules are unchanged.
-- ===========================================================================
