import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getActiveProducts } from "@/lib/catalog/queries";
import { filterAndSortProducts, isSortParam } from "@/lib/catalog-logic";

export const metadata = {
  title: "Shop Hijabs",
  description: "Explore our collection of modest hijabs.",
};

export default async function HijabsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sort = isSortParam(params.sort) ? params.sort : undefined;
  const allProducts = await getActiveProducts();
  const filteredProducts = filterAndSortProducts(allProducts, {
    category: "Hijabs", // Enforce Hijabs category
    size: typeof params.size === "string" ? params.size : undefined,
  }, sort);

  return (
    <CatalogShell title="Hijabs" resultCount={filteredProducts.length}>
      <ProductGrid products={filteredProducts} />
    </CatalogShell>
  );
}
