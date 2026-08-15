import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/authorization";
import { hasPermission } from "@/lib/admin/permissions";
import {
  ProductForm,
  type ProductCategoryOption,
  type ProductFormData,
} from "@/components/admin/product-form";
import {
  ProductImagesManager,
  type AdminProductImageRow,
} from "@/components/admin/product-images-manager";

export const metadata: Metadata = {
  title: "Admin · Edit Product",
  robots: { index: false, follow: false },
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const staff = await requirePermission("catalog.view");
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, category_id, description, fabric, care, shipping_info, price, is_active, is_featured, is_new, is_signature, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { data: imageRows } = await supabase
    .from("product_images")
    .select("id, storage_path, alt_text, position, is_primary")
    .eq("product_id", id)
    .order("position", { ascending: true });

  const categories = (categoryRows ?? []) as ProductCategoryOption[];
  const isOwner = staff.role === "owner";
  const canEdit = hasPermission(staff.role, "catalog.edit");

  const formData: ProductFormData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.category_id,
    description: product.description,
    fabric: product.fabric,
    care: product.care,
    shippingInfo: product.shipping_info,
    price: product.price,
    isActive: product.is_active,
    isFeatured: product.is_featured,
    isNew: product.is_new,
    isSignature: product.is_signature,
    sortOrder: product.sort_order,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Edit product</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {product.name} · {product.slug}
        {product.is_active ? null : (
          <span className="ml-3 inline-block bg-[var(--color-surface)] px-2 py-0.5 text-[var(--color-crimson)]">
            Inactive
          </span>
        )}
      </p>

      <ProductForm
        mode="edit"
        product={formData}
        categories={categories}
        isOwner={isOwner}
        canEdit={canEdit}
      />

      <div className="mt-10">
        <ProductImagesManager
          productId={id}
          images={(imageRows ?? []) as AdminProductImageRow[]}
          canManage={canEdit}
        />
      </div>
    </div>
  );
}
