/**
 * Product image source resolution.
 *
 * `product_images.storage_path` holds one of two forms:
 *   * "/images/home/..." — a LOCAL placeholder asset in the Next.js public/
 *     directory (Phase 2 seeds). Served as-is.
 *   * "<product-uuid>/<object-uuid>.jpg" — a real object inside the PUBLIC
 *     `product-images` Supabase Storage bucket (Phase 6 uploads). Resolved to
 *     the full public storage URL.
 *
 * This keeps the seeded placeholders working while letting individual products
 * transition to uploaded imagery without a bulk migration.
 */

export const PRODUCT_IMAGE_BUCKET = "product-images";

/** Placeholder rows reference local public assets with a leading slash. */
export function isPlaceholderImage(path: string): boolean {
  return path.startsWith("/");
}

export function resolveImageSrc(path: string): string {
  if (!path) return "";
  if (isPlaceholderImage(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`;
}
