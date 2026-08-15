import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/authorization";
import {
  ProductForm,
  type ProductCategoryOption,
} from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Admin · New Product",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  const staff = await requirePermission("catalog.edit");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as ProductCategoryOption[];

  return (
    <div className="mx-auto max-w-3xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">New product</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Creating a product sets its initial price and requires owner MFA (AAL2).
        After creation you&apos;ll be taken to the edit page to manage its images.
      </p>

      {staff.role !== "owner" ? (
        <p className="mt-8 text-[var(--color-muted)]">
          Only the owner can create products. Store managers can edit existing
          products from the catalog.
        </p>
      ) : error ? (
        <p className="mt-8 text-[var(--color-crimson)]">
          Unable to load categories. Please try again.
        </p>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">
          No categories are available yet.
        </p>
      ) : (
        <ProductForm mode="new" categories={categories} isOwner />
      )}
    </div>
  );
}
