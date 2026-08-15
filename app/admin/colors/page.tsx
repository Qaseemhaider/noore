import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/authorization";
import { hasPermission } from "@/lib/admin/permissions";
import {
  ReferenceManager,
  type ReferenceField,
  type ReferenceRow,
} from "@/components/admin/reference-manager";

export const metadata: Metadata = {
  title: "Admin · Colors",
  robots: { index: false, follow: false },
};

type ColorRow = { id: string; name: string; hex: string | null; sort_order: number };

const FIELDS: ReferenceField[] = [
  { key: "name", label: "Name", required: true },
  { key: "hex", label: "Hex", type: "hex", placeholder: "#A29688" },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default async function AdminColorsPage() {
  const staff = await requirePermission("catalog.view");
  const canManage = hasPermission(staff.role, "catalog.edit");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("colors")
    .select("id, name, hex, sort_order")
    .order("sort_order", { ascending: true });

  const rows: ReferenceRow[] = ((data ?? []) as ColorRow[]).map((color) => ({
    id: color.id,
    values: {
      name: color.name,
      hex: color.hex ?? "",
      sortOrder: String(color.sort_order),
    },
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Colors</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Colors are referenced by product variants. Editing requires owner or
        store-manager access (MFA for non-owner).
      </p>

      {error ? (
        <p className="mt-8 text-[var(--color-crimson)]">
          Unable to load colors. Please try again.
        </p>
      ) : (
        <ReferenceManager
          canManage={canManage}
          createLabel="Add color"
          entity="color"
          fields={FIELDS}
          rows={rows}
        />
      )}
    </div>
  );
}
