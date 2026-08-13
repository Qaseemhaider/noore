/**
 * NOORE admin domain types. Public shapes only — never raw database rows or
 * secrets. `StaffContext` is what the server exposes to admin UI after the
 * DB-authoritative authorization chain has run.
 */

export type StaffRole = "owner" | "store_manager" | "seo_editor" | "support";

export const STAFF_ROLES: readonly StaffRole[] = [
  "owner",
  "store_manager",
  "seo_editor",
  "support",
];

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value);
}

export type AssuranceLevel = "aal1" | "aal2";

export type StaffContext = {
  id: string;
  email: string;
  displayName: string | null;
  role: StaffRole;
  isActive: boolean;
  aal: AssuranceLevel | null;
};

/** Shape returned by the get_my_staff_context() SECURITY DEFINER function. */
export type StaffMemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
