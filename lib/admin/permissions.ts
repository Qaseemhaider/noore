import type { StaffRole } from "./types";

/**
 * NOORE role / permission matrix (Phase 1.1, locked).
 *
 * A simple typed permission map — no enterprise RBAC. `ROLE_PERMISSIONS` is
 * the single source of truth used by server authorization and by the admin
 * navigation (which only renders entries the caller may see).
 */

export const PERMISSIONS = {
  "catalog.view": { label: "View catalog" },
  "catalog.edit": { label: "Edit catalog" },
  "inventory.edit": { label: "Adjust inventory" },
  "orders.view": { label: "View orders" },
  "orders.manage": { label: "Manage orders" },
  "reviews.moderate": { label: "Moderate reviews" },
  "contact.manage": { label: "Manage contact messages" },
  "content.edit": { label: "Edit content" },
  "seo.edit": { label: "Edit SEO / meta" },
  "staff.manage": { label: "Manage staff" },
  "security.manage": { label: "Manage security settings" },
  "settings.shipping": { label: "Configure shipping" },
  "settings.payments": { label: "Configure payments" },
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Permissions that future phases must gate behind OWNER + AAL2. Phase 5
 * enforces AAL2 on the safe security probe action; the remaining entries are
 * marked here so Phase 6+ can enforce them without changing the matrix.
 */
export const AAL2_PERMISSIONS: ReadonlySet<Permission> = new Set([
  "staff.manage",
  "security.manage",
  "catalog.edit",
  "inventory.edit",
  "settings.shipping",
  "settings.payments",
  "orders.manage",
]);

const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  owner: [
    "catalog.view",
    "catalog.edit",
    "inventory.edit",
    "orders.view",
    "orders.manage",
    "reviews.moderate",
    "contact.manage",
    "content.edit",
    "seo.edit",
    "staff.manage",
    "security.manage",
    "settings.shipping",
    "settings.payments",
  ],

  store_manager: [
    "catalog.view",
    "catalog.edit",
    "inventory.edit",
    "orders.view",
    "orders.manage",
    "reviews.moderate",
    "contact.manage",
    "content.edit",
    "seo.edit",
  ],

  seo_editor: ["catalog.view", "content.edit", "seo.edit"],

  // Order/customer support + contact/tracking only. No catalog pricing,
  // no security, no payment configuration.
  support: ["orders.view", "contact.manage"],
};

export function rolePermissions(role: StaffRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return rolePermissions(role).includes(permission);
}

export function permissionRequiresAal2(permission: Permission): boolean {
  return AAL2_PERMISSIONS.has(permission);
}
