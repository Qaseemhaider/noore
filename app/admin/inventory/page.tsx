import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/authorization";
import { InventoryAdjustForm } from "@/components/admin/inventory-adjust-form";

export const metadata: Metadata = {
  title: "Admin · Inventory",
  robots: { index: false, follow: false },
};

type AdminVariantRow = {
  id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  sku: string;
  color_name: string;
  color_hex: string | null;
  size_name: string;
  stock_quantity: number;
  is_active: boolean;
  updated_at: string;
};

export default async function AdminInventoryPage() {
  const staff = await requirePermission("inventory.edit");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_admin_variants", {});

  const rows = (data ?? []) as AdminVariantRow[];

  return (
    <div className="mx-auto max-w-5xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Inventory</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Exact stock quantities are admin-only. Adjusting stock is a high-risk
        action that requires owner or store-manager access with MFA (AAL2).
      </p>

      {error ? (
        <p className="mt-8 text-[var(--color-crimson)]">
          Unable to load inventory. Please try again.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">
          No variants found.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {rows.map((variant) => (
            <li
              key={variant.id}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{variant.product_name}</p>
                  <p className="type-meta">
                    {variant.sku} · {variant.color_name}
                    {variant.color_hex ? (
                      <span className="ml-2 inline-block h-3 w-3 border border-[var(--color-border)] align-middle"
                        style={{ backgroundColor: variant.color_hex }} />
                    ) : null}{" "}
                    · {variant.size_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Stock:{" "}
                    <span className="font-semibold">{variant.stock_quantity}</span>
                  </p>
                  <p className="type-meta">
                    {variant.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <InventoryAdjustForm
                variantId={variant.id}
                sku={variant.sku}
                currentStock={variant.stock_quantity}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="type-meta mt-8 text-[var(--color-muted)]">
        Signed in as {staff.email ?? ""}. The storefront only ever sees the
        is_in_stock flag, never exact quantities.
      </p>
    </div>
  );
}
