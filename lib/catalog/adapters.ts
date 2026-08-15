import type { Product } from "@/lib/catalog-data";
import { resolveImageSrc } from "./image-url";

export const CATEGORY_NAMES = ["Abayas", "Hijabs", "Chadars"] as const;
export type CategoryName = (typeof CATEGORY_NAMES)[number];

export interface CatalogImageRow {
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
}

export interface CatalogCategoryRow {
  slug: string;
  name: string;
}

export interface CatalogVariantRow {
  is_active: boolean | null;
  is_in_stock: boolean | null;
  colors: { name: string; sort_order: number } | null;
  sizes: { name: string; sort_order: number } | null;
}

export interface CatalogProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fabric: string | null;
  care: string | null;
  shipping_info: string | null;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_signature: boolean;
  sort_order: number;
  categories: CatalogCategoryRow | null;
  product_images: CatalogImageRow[];
  storefront_variants: CatalogVariantRow[];
}

function toCategory(name: string | undefined | null): CategoryName {
  if (!name || !(CATEGORY_NAMES as readonly string[]).includes(name)) {
    throw new Error(`Catalog: unknown product category "${name}"`);
  }
  return name as CategoryName;
}

export function isPurchasableVariant(variant: CatalogVariantRow): boolean {
  return variant.is_active !== false && variant.is_in_stock === true;
}

export function mapProductRow(row: CatalogProductRow): Product {
  const variants = row.storefront_variants
    .filter(isPurchasableVariant)
    .sort((a, b) => (a.sizes?.sort_order ?? 0) - (b.sizes?.sort_order ?? 0));

  const sizes = Array.from(
    new Set(
      variants
        .map((variant) => variant.sizes?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const availableColors = Array.from(
    new Set(
      [...variants]
        .sort((a, b) => (a.colors?.sort_order ?? 0) - (b.colors?.sort_order ?? 0))
        .map((variant) => variant.colors?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const images = [...row.product_images]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      src: resolveImageSrc(image.storage_path),
      alt: image.alt_text ?? row.name,
    }));

  const primary = images[0] ?? { src: "", alt: row.name };

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    category: toCategory(row.categories?.name),
    price: row.price,
    image: primary,
    images,
    sizes,
    availableColors,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isSignature: row.is_signature ?? false,
    isActive: row.is_active ?? false,
    description: row.description ?? "",
    fabric: row.fabric ?? "",
    care: row.care ?? "",
    shippingInfo: row.shipping_info ?? "",
    reviews: { count: 0, rating: 0 },
    relatedProductIds: [],
  };
}

export function mapProductRows(rows: CatalogProductRow[]): Product[] {
  return rows.map(mapProductRow);
}
