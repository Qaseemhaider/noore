import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductGrid } from "@/components/catalog/product-grid";
import { products } from "@/lib/catalog-data";
import { filterAndSortProducts, isSortParam } from "@/lib/catalog-logic";

export const metadata = {
  title: "Shop All",
  description: "Browse all NOORE modest fashion collections.",
};

export default async function ShopAllPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sort = isSortParam(params.sort) ? params.sort : undefined;
  const filteredProducts = filterAndSortProducts(products, {
    category: typeof params.category === "string" ? params.category : undefined,
    size: typeof params.size === "string" ? params.size : undefined,
  }, sort);

  return (
    <CatalogShell title="All Products" resultCount={filteredProducts.length}>
      <ProductGrid products={filteredProducts} />
    </CatalogShell>
  );
}
