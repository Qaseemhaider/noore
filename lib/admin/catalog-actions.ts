"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaffContext } from "./authorization";
import { hasPermission } from "./permissions";
import type { StaffContext } from "./types";
import {
  categorySchema,
  categoryUpdateSchema,
  colorSchema,
  colorUpdateSchema,
  inventoryAdjustSchema,
  productCreateSchema,
  productImageAltSchema,
  productImageDeleteSchema,
  productImageMoveSchema,
  productPriceSchema,
  productStatusSchema,
  productUpdateSchema,
  referenceMoveSchema,
  sizeSchema,
  sizeUpdateSchema,
  type ReferenceEntity,
} from "./validation";

/**
 * Phase 6 admin catalog server actions. Every action independently re-verifies
 * staff status, role permission and AAL2 from the database — proxy.ts and the
 * browser are never trusted — and the underlying RPC re-verifies again. Errors
 * are mapped to safe, curated messages (never raw Supabase payloads).
 */

export type CatalogActionResult =
  | { status: "ok"; message: string; id?: string }
  | { status: "denied"; message: string }
  | { status: "mfa_required"; message: string }
  | { status: "error"; message: string };

function friendlyRpcMessage(raw: string | undefined): string {
  const message = (raw ?? "").toLowerCase();
  if (message.includes("aal2") || message.includes("mfa")) {
    return "MFA (AAL2) is required for this action. Complete the challenge on the Security page.";
  }
  if (message.includes("slug already in use")) {
    return "That slug is already in use.";
  }
  if (message.includes("name already in use")) {
    return "That name is already in use.";
  }
  if (message.includes("already in use")) {
    return "That value is already in use.";
  }
  if (message.includes("inventory would go negative")) {
    return "Stock cannot go negative.";
  }
  if (message.includes("not found")) {
    return "That record was not found.";
  }
  if (message.includes("only the owner") || message.includes("only the owner or store manager")) {
    return "You are not authorized to do that.";
  }
  if (message.includes("permission required") || message.includes("not authorized")) {
    return "You are not authorized to do that.";
  }
  return "The database rejected that change. Nothing was modified.";
}

/** Returns the caller's staff context, or a denied result. */
async function guardStaff(): Promise<{ staff: StaffContext } | { result: CatalogActionResult }> {
  const staff = await getStaffContext();
  if (!staff || !staff.isActive) {
    return { result: { status: "denied", message: "You are not authorized to do that." } };
  }
  return { staff };
}

function mfaRequired(): CatalogActionResult {
  return {
    status: "mfa_required",
    message: "MFA (AAL2) is required for this action. Complete the challenge on the Security page.",
  };
}

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

function revalidateStorefront(): void {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/all");
  revalidatePath("/shop/abayas");
  revalidatePath("/shop/hijabs");
  revalidatePath("/shop/chadars");
}

// ---------------------------------------------------------------
// Products
// ---------------------------------------------------------------

export async function createProductAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const { staff } = guard;
  if (!hasPermission(staff.role, "catalog.edit") || staff.role !== "owner") {
    return { status: "denied", message: "Only the owner can create products." };
  }
  if (staff.aal !== "aal2") return mfaRequired();

  const parsed = productCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }
  const p = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_product", {
    p_slug: p.slug,
    p_category_id: p.categoryId,
    p_name: p.name,
    p_price: p.price,
    ...(p.description ? { p_description: p.description } : {}),
    ...(p.fabric ? { p_fabric: p.fabric } : {}),
    ...(p.care ? { p_care: p.care } : {}),
    ...(p.shippingInfo ? { p_shipping_info: p.shippingInfo } : {}),
    p_is_active: p.isActive,
    p_is_featured: p.isFeatured,
    p_is_new: p.isNew,
    p_is_signature: p.isSignature,
    p_sort_order: p.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/products");
  revalidateStorefront();
  return { status: "ok", message: "Product created.", id: data ?? undefined };
}

export async function updateProductAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const { staff } = guard;
  if (!hasPermission(staff.role, "catalog.edit")) {
    return { status: "denied", message: "You are not authorized to edit products." };
  }
  if (staff.aal !== "aal2") return mfaRequired();

  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }
  const p = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_product", {
    p_product_id: p.productId,
    p_slug: p.slug,
    p_category_id: p.categoryId,
    p_name: p.name,
    ...(p.description ? { p_description: p.description } : {}),
    ...(p.fabric ? { p_fabric: p.fabric } : {}),
    ...(p.care ? { p_care: p.care } : {}),
    ...(p.shippingInfo ? { p_shipping_info: p.shippingInfo } : {}),
    p_is_featured: p.isFeatured,
    p_is_new: p.isNew,
    p_is_signature: p.isSignature,
    p_sort_order: p.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${p.productId}`);
  revalidatePath(`/product/${p.slug}`);
  revalidateStorefront();
  return { status: "ok", message: "Product updated." };
}

export async function setProductPriceAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const { staff } = guard;
  if (staff.role !== "owner") {
    return { status: "denied", message: "Only the owner can change product prices." };
  }
  if (staff.aal !== "aal2") return mfaRequired();

  const parsed = productPriceSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_product_price", {
    p_product_id: parsed.data.productId,
    p_new_price: parsed.data.price,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidateStorefront();
  return { status: "ok", message: "Price updated." };
}

export async function setProductStatusAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const { staff } = guard;
  if (staff.role !== "owner" && staff.role !== "store_manager") {
    return {
      status: "denied",
      message: "Only the owner and store manager can change product status.",
    };
  }
  if (staff.aal !== "aal2") return mfaRequired();

  const parsed = productStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_product_status", {
    p_product_id: parsed.data.productId,
    p_is_active: parsed.data.isActive,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${parsed.data.productId}`);
  revalidateStorefront();
  return {
    status: "ok",
    message:
      data === "product_reactivated"
        ? "Product reactivated."
        : data === "no_change"
          ? "Product status is unchanged."
          : "Product deactivated.",
  };
}

// ---------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------

export async function adjustInventoryAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const { staff } = guard;
  if (!hasPermission(staff.role, "inventory.edit")) {
    return { status: "denied", message: "Only the owner and store manager can adjust inventory." };
  }
  if (staff.aal !== "aal2") return mfaRequired();

  const parsed = inventoryAdjustSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_inventory", {
    p_variant_id: parsed.data.variantId,
    p_delta: parsed.data.delta,
    p_reason: parsed.data.reason,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/inventory");
  revalidateStorefront();
  return { status: "ok", message: "Inventory adjusted." };
}

// ---------------------------------------------------------------
// Reference data: categories, colors, sizes
// ---------------------------------------------------------------

function referenceGuard(staff: StaffContext, entity: string): CatalogActionResult | null {
  if (!hasPermission(staff.role, "catalog.edit")) {
    return { status: "denied", message: `You are not authorized to edit ${entity}.` };
  }
  if (staff.role !== "owner" && staff.aal !== "aal2") {
    return mfaRequired();
  }
  return null;
}

export async function createCategoryAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "categories");
  if (blocked) return blocked;

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_category", {
    p_slug: parsed.data.slug,
    p_name: parsed.data.name,
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return { status: "ok", message: "Category created.", id: data ?? undefined };
}

export async function updateCategoryAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "categories");
  if (blocked) return blocked;

  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_category", {
    p_category_id: parsed.data.id,
    p_slug: parsed.data.slug,
    p_name: parsed.data.name,
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/categories");
  revalidateStorefront();
  return { status: "ok", message: "Category updated." };
}

export async function createColorAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "colors");
  if (blocked) return blocked;

  const parsed = colorSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_color", {
    p_name: parsed.data.name,
    ...(parsed.data.hex ? { p_hex: parsed.data.hex } : {}),
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/colors");
  revalidateStorefront();
  return { status: "ok", message: "Color created.", id: data ?? undefined };
}

export async function updateColorAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "colors");
  if (blocked) return blocked;

  const parsed = colorUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_color", {
    p_color_id: parsed.data.id,
    p_name: parsed.data.name,
    ...(parsed.data.hex ? { p_hex: parsed.data.hex } : {}),
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/colors");
  revalidateStorefront();
  return { status: "ok", message: "Color updated." };
}

export async function createSizeAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "sizes");
  if (blocked) return blocked;

  const parsed = sizeSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_size", {
    p_name: parsed.data.name,
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/sizes");
  revalidateStorefront();
  return { status: "ok", message: "Size created.", id: data ?? undefined };
}

export async function updateSizeAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "sizes");
  if (blocked) return blocked;

  const parsed = sizeUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_size", {
    p_size_id: parsed.data.id,
    p_name: parsed.data.name,
    p_sort_order: parsed.data.sortOrder,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidatePath("/admin/sizes");
  revalidateStorefront();
  return { status: "ok", message: "Size updated." };
}

// ---------------------------------------------------------------
// Reference reorder (move up / move down)
// ---------------------------------------------------------------

async function listReferenceRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entity: ReferenceEntity,
): Promise<{ id: string; sort_order: number }[]> {
  const result = (await (entity === "category"
    ? supabase
        .from("categories")
        .select("id, sort_order")
        .order("sort_order", { ascending: true, nullsFirst: true })
    : entity === "color"
      ? supabase
          .from("colors")
          .select("id, sort_order")
          .order("sort_order", { ascending: true, nullsFirst: true })
      : supabase
          .from("sizes")
          .select("id, sort_order")
          .order("sort_order", { ascending: true, nullsFirst: true })) as unknown as {
    data: { id: string; sort_order: number }[] | null;
  });
  return result.data ?? [];
}

async function reorderReferenceRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entity: ReferenceEntity,
  id: string,
  sortOrder: number,
): Promise<{ error: { message: string } | null }> {
  if (entity === "category") {
    return supabase.rpc("reorder_category", { p_category_id: id, p_sort_order: sortOrder });
  }
  if (entity === "color") {
    return supabase.rpc("reorder_color", { p_color_id: id, p_sort_order: sortOrder });
  }
  return supabase.rpc("reorder_size", { p_size_id: id, p_sort_order: sortOrder });
}

export async function moveReferenceAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = referenceGuard(guard.staff, "reference items");
  if (blocked) return blocked;

  const parsed = referenceMoveSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }
  const { entity, id, direction } = parsed.data;

  const supabase = await createClient();
  const rows = await listReferenceRows(supabase, entity);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) {
    return { status: "error", message: "That record was not found." };
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return { status: "ok", message: "That item is already at the edge." };
  }

  const current = rows[index];
  const neighbor = rows[targetIndex];

  const first = await reorderReferenceRpc(supabase, entity, neighbor.id, current.sort_order);
  if (first.error) {
    return { status: "error", message: friendlyRpcMessage(first.error.message) };
  }
  const second = await reorderReferenceRpc(supabase, entity, current.id, neighbor.sort_order);
  if (second.error) {
    return { status: "error", message: friendlyRpcMessage(second.error.message) };
  }

  revalidatePath(`/admin/${entity === "category" ? "categories" : entity === "color" ? "colors" : "sizes"}`);
  revalidateStorefront();
  return { status: "ok", message: "Order updated." };
}

// ---------------------------------------------------------------
// Product images (admin management)
// ---------------------------------------------------------------

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ImageKind = "jpg" | "png" | "webp";

/** Lightweight magic-byte sniff so the server never trusts the client's MIME. */
function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function imageGuard(staff: StaffContext): CatalogActionResult | null {
  if (!hasPermission(staff.role, "catalog.edit")) {
    return { status: "denied", message: "You are not authorized to manage product images." };
  }
  if (staff.aal !== "aal2") {
    return mfaRequired();
  }
  return null;
}

/**
 * Uploads a product image. File bytes are validated server-side (size, MIME
 * allow-list and magic bytes), written to the PUBLIC `product-images` bucket at
 * a server-generated path `{productId}/{uuid}.{ext}`, then recorded in
 * product_images via the hardened RPC. The service-role key is never exposed
 * to the browser; the upload runs as the authenticated staff session and the
 * storage insert policy (M013) enforces the staff-only gate at the database.
 */
export async function uploadProductImageAction(
  _previous: CatalogActionResult | null,
  formData: FormData,
): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = imageGuard(guard.staff);
  if (blocked) return blocked;

  const productId = productImageIdFromFormData(formData);
  if (!productId) {
    return { status: "error", message: "Invalid product identifier." };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string" || !(file instanceof Blob)) {
    return { status: "error", message: "Please choose an image file to upload." };
  }
  if (file.size === 0) {
    return { status: "error", message: "The selected file is empty." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { status: "error", message: "Images must be 5 MB or smaller." };
  }
  if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
    return { status: "error", message: "Only JPEG, PNG and WebP images are allowed." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImageKind(bytes);
  if (!kind) {
    return { status: "error", message: "That file is not a valid JPEG, PNG or WebP image." };
  }

  const path = `${productId}/${crypto.randomUUID()}.${kind}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploadError) {
    return { status: "error", message: "Upload failed. Please try again." };
  }

  const { data: imageId, error: addError } = await supabase.rpc("product_image_add", {
    p_product_id: productId,
    p_storage_path: path,
  });
  if (addError) {
    await supabase.storage.from("product-images").remove([path]);
    return { status: "error", message: friendlyRpcMessage(addError.message) };
  }

  revalidateStorefront();
  return { status: "ok", message: "Image uploaded.", id: imageId ?? undefined };
}

function productImageIdFromFormData(formData: FormData): string | null {
  const raw = formData.get("productId");
  if (typeof raw !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

export async function updateProductImageAltAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = imageGuard(guard.staff);
  if (blocked) return blocked;

  const parsed = productImageAltSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("product_image_set_alt", {
    p_image_id: parsed.data.imageId,
    p_alt_text: parsed.data.altText,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidateStorefront();
  return { status: "ok", message: "Alt text updated." };
}

export async function setProductImagePrimaryAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = imageGuard(guard.staff);
  if (blocked) return blocked;

  const parsed = productImageDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("product_image_set_primary", {
    p_image_id: parsed.data.imageId,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidateStorefront();
  return { status: "ok", message: "Primary image updated." };
}

export async function moveProductImageAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = imageGuard(guard.staff);
  if (blocked) return blocked;

  const parsed = productImageMoveSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("product_image_move", {
    p_image_id: parsed.data.imageId,
    p_direction: parsed.data.direction,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  revalidateStorefront();
  return {
    status: "ok",
    message: data === "no_change" ? "Already at the edge." : "Image moved.",
  };
}

export async function removeProductImageAction(input: unknown): Promise<CatalogActionResult> {
  const guard = await guardStaff();
  if ("result" in guard) return guard.result;
  const blocked = imageGuard(guard.staff);
  if (blocked) return blocked;

  const parsed = productImageDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: firstIssueMessage(parsed.error) };
  }

  const supabase = await createClient();
  const { data: storagePath, error } = await supabase.rpc("product_image_delete", {
    p_image_id: parsed.data.imageId,
  });
  if (error) {
    return { status: "error", message: friendlyRpcMessage(error.message) };
  }

  // Placeholder rows reference local public assets, not the bucket — only
  // remove the backing object for real bucket paths (no leading slash).
  if (typeof storagePath === "string" && storagePath && !storagePath.startsWith("/")) {
    const { error: removeError } = await supabase.storage
      .from("product-images")
      .remove([storagePath]);
    if (removeError) {
      return {
        status: "error",
        message: "The image record was removed but the file could not be deleted.",
      };
    }
  }

  revalidateStorefront();
  return { status: "ok", message: "Image removed." };
}
