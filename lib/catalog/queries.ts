import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/catalog-data";
import {
  isPurchasableVariant,
  mapProductRow,
  mapProductRows,
  type CatalogProductRow,
} from "./adapters";

const PRODUCT_SELECT = `
  id, slug, name, description, fabric, care, shipping_info, price,
  is_active, is_featured, is_new, is_signature, sort_order,
  categories ( slug, name ),
  product_images ( storage_path, alt_text, position, is_primary ),
  storefront_variants (
    is_active, is_in_stock,
    colors ( name, sort_order ),
    sizes ( name, sort_order )
  )
`;

const RELATED_SELECT =
  "related:products!product_relations_related_product_id_fkey(slug)";

type RelationRow = {
  related: { slug: string } | null;
};

function toCatalogProductRows(data: unknown): CatalogProductRow[] {
  return data as CatalogProductRow[];
}

function purchasableProductRows(rows: CatalogProductRow[]): CatalogProductRow[] {
  return rows.filter((row) => row.storefront_variants.some(isPurchasableVariant));
}

/**
 * All active, purchasable products, ordered by canonical sort_order.
 */
export const getActiveProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Catalog query failed: ${error.message}`);
  }

  return mapProductRows(purchasableProductRows(toCatalogProductRows(data ?? [])));
});

/**
 * A single active product by canonical slug, including its related-product
 * slugs from product_relations. Returns null when unknown or not purchasable.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Catalog query failed: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  const rows = purchasableProductRows([data as CatalogProductRow]);
  if (rows.length === 0) {
    return null;
  }

  const product = mapProductRow(rows[0]);

  const { data: relations, error: relationsError } = await supabase
    .from("product_relations")
    .select(RELATED_SELECT)
    .eq("product_id", rows[0].id);

  if (relationsError) {
    throw new Error(`Catalog relations query failed: ${relationsError.message}`);
  }

  product.relatedProductIds = (relations as RelationRow[] | null)
    ?.map((relation) => relation.related?.slug)
    .filter((relatedSlug): relatedSlug is string => Boolean(relatedSlug)) ?? [];

  return product;
});

/**
 * Products matching a list of canonical slugs (used for wishlist resolution
 * and "Complete the Look").
 */
export const getProductsBySlugs = cache(async (slugs: string[]): Promise<Product[]> => {
  if (slugs.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("slug", slugs)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Catalog query failed: ${error.message}`);
  }

  return mapProductRows(purchasableProductRows(toCatalogProductRows(data ?? [])));
});

/**
 * Case-insensitive search across product name and description.
 */
export const searchProducts = cache(async (query: string): Promise<Product[]> => {
  const term = query.trim().replace(/[*%\\]/g, "");
  if (!term) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .or(`name.ilike.*${term}*,description.ilike.*${term}*`)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Catalog search failed: ${error.message}`);
  }

  return mapProductRows(purchasableProductRows(toCatalogProductRows(data ?? [])));
});

/**
 * Homepage merchandising shelves: signature pieces and new arrivals, derived
 * from the canonical is_signature / is_new flags.
 */
export const getHomepageShelves = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Catalog query failed: ${error.message}`);
  }

  const rows = purchasableProductRows(toCatalogProductRows(data ?? []));
  return {
    signature: mapProductRows(rows.filter((row) => row.is_signature)),
    newArrivals: mapProductRows(rows.filter((row) => row.is_new)),
  };
});
