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
  title: "Admin · Sizes",
  robots: { index: false, follow: false },
};

type SizeRow = { id: string; name: string; sort_order: number };

const FIELDS: ReferenceField[] = [
  { key: "name", label: "Name", required: true },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default async function AdminSizesPage() {
  const staff = await requirePermission("catalog.view");
  const canManage = hasPermission(staff.role, "catalog.edit");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sizes")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  const rows: ReferenceRow[] = ((data ?? []) as SizeRow[]).map((size) => ({
    id: size.id,
    values: {
      name: size.name,
      sortOrder: String(size.sort_order),
    },
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Sizes</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Sizes are referenced by product variants. Editing requires owner or
        store-manager access (MFA for non-owner).
      </p>

      {error ? (
        <p className="mt-8 text-[var(--color-crimson)]">
          Unable to load sizes. Please try again.
        </p>
      ) : (
        <ReferenceManager
          canManage={canManage}
          createLabel="Add size"
          entity="size"
          fields={FIELDS}
          rows={rows}
        />
      )}
    </div>
  );
}
