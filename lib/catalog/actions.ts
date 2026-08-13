"use server";

import { getProductsBySlugs, searchProducts } from "./queries";
import type { Product } from "@/lib/catalog-data";

/**
 * Case-insensitive catalog search for the client search page.
 */
export async function searchProductsAction(query: string): Promise<Product[]> {
  const term = typeof query === "string" ? query.slice(0, 100) : "";
  return searchProducts(term);
}

/**
 * Resolve stored wishlist references (canonical slugs) against the catalog.
 */
export async function getWishlistProductsAction(
  slugs: string[],
): Promise<Product[]> {
  const safeSlugs = Array.isArray(slugs)
    ? slugs
        .filter((slug): slug is string => typeof slug === "string")
        .slice(0, 100)
    : [];
  return getProductsBySlugs(safeSlugs);
}
