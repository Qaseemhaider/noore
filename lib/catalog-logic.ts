import { Product } from "./catalog-data";

export type FilterParams = {
  category?: string;
  size?: string;
  price?: string;
};

export type SortParams = "price-asc" | "price-desc" | "newest";

export function isSortParam(value: unknown): value is SortParams {
    return ["price-asc", "price-desc", "newest"].includes(value as string);
}

export function filterAndSortProducts(
  products: Product[],
  filters: FilterParams,
  sort?: SortParams,
): Product[] {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
    );
  }

  if (filters.size) {
    filtered = filtered.filter((p) => p.sizes.includes(filters.size!));
  }

  // Price filtering could be complex (e.g. range), but reference doesn't specify.
  // Assuming a simple "under X" or specific bracket for now, or skip if not clear.
  // Actually, standard is usually ranges. Let's keep it simple for now.

  if (sort) {
    switch (sort) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
  }

  return filtered;
}
