import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/authorization";
import { hasPermission } from "@/lib/admin/permissions";
import { formatPrice } from "@/lib/format-price";

export const metadata: Metadata = {
  title: "Admin · Products",
  robots: { index: false, follow: false },
};

type ProductListRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  categories: { slug: string; name: string } | null;
  storefront_variants: { is_in_stock: boolean }[];
};

export default async function AdminProductsPage() {
  const staff = await requirePermission("catalog.view");
  const canEdit = hasPermission(staff.role, "catalog.edit");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, price, is_active, sort_order, categories(slug, name), storefront_variants(is_in_stock)",
    )
    .order("sort_order", { ascending: true });

  const rows = (data ?? []) as unknown as ProductListRow[];

  return (
    <div className="mx-auto max-w-5xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-page-title">Products</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Catalog view for {staff.email ?? ""}.
          </p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/products/new"
            prefetch={false}
            className="noore-button--auth-primary type-button min-w-40"
          >
            New product
          </Link>
        ) : null}
      </div>

      {error ? (
        <p className="mt-8 text-[var(--color-crimson)]">
          Unable to load the product list. Please try again.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">
          No products found.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] type-meta uppercase">
                <th scope="col" className="py-3 pr-4 font-semibold">Name</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Category</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Price</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Status</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Order</th>
                <th scope="col" className="py-3 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const inStock = product.storefront_variants.some(
                  (variant) => variant.is_in_stock,
                );
                return (
                  <tr key={product.id} className="border-b border-[var(--color-border)]">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        prefetch={false}
                        className="font-semibold underline underline-offset-3 hover:text-[var(--color-crimson)]"
                      >
                        {product.name}
                      </Link>
                      <p className="type-meta">{product.slug}</p>
                    </td>
                    <td className="py-3 pr-4">{product.categories?.name ?? "—"}</td>
                    <td className="py-3 pr-4">{formatPrice(product.price)}</td>
                    <td className="py-3 pr-4">
                      {product.is_active ? (
                        inStock ? (
                          <span className="text-[var(--color-obsidian)]">Active · in stock</span>
                        ) : (
                          <span className="text-[var(--color-muted)]">Active · out of stock</span>
                        )
                      ) : (
                        <span className="text-[var(--color-crimson)]">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">{product.sort_order}</td>
                    <td className="py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        prefetch={false}
                        className="type-button text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="type-meta mt-8 text-[var(--color-muted)]">
        Inventory (exact stock) lives on the Inventory page. Product editing
        requires owner or store-manager access with MFA (AAL2).
      </p>
    </div>
  );
}
