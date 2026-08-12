import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductGrid } from "@/components/catalog/product-grid";
import { products } from "@/lib/catalog-data";
import { filterAndSortProducts, isSortParam } from "@/lib/catalog-logic";

export const metadata = {
  title: "Shop Chadars",
  description: "Explore our collection of modest chadars.",
};

export default async function ChadarsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sort = isSortParam(params.sort) ? params.sort : undefined;
  const filteredProducts = filterAndSortProducts(products, {
    category: "Chadars", // Enforce Chadars category
    size: typeof params.size === "string" ? params.size : undefined,
  }, sort);

  return (
    <CatalogShell title="Chadars" resultCount={filteredProducts.length}>
      <ProductGrid products={filteredProducts} />
    </CatalogShell>
  );
}
