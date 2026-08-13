import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, type Permission } from "./permissions";
import { isStaffRole, type StaffContext, type StaffMemberRow } from "./types";

/**
 * DB-authoritative staff authorization chain (deny by default):
 *
 *   1. supabase.auth.getUser()              — verifies the session token
 *   2. get_my_staff_context()               — SECURITY DEFINER, returns the
 *      caller's staff_members row or NULL   (RLS/no-grant tables are never
 *                                             queried directly from the app)
 *   3. is_active === true
 *   4. role permission check
 *   5. AAL2 check when required
 *
 * Nothing here ever trusts browser role values, localStorage, user metadata,
 * hidden form fields or URL parameters. This module is `server-only` and every
 * privileged page/action re-runs it — proxy.ts is never the real check.
 *
 * NOTE: no React.cache() here on purpose. Staff status must be read fresh on
 * every request so that deactivation / role changes take effect immediately
 * and no stale authorization state ever persists.
 */

function mapStaffRow(row: StaffMemberRow): Omit<StaffContext, "aal"> | null {
  if (!row || typeof row !== "object") return null;
  if (!isStaffRole(row.role)) return null; // unknown role => deny by default
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? null,
    role: row.role,
    isActive: row.is_active,
  };
}

/**
 * The AAL claim lives in the JWT payload, not on the `User` record returned by
 * `getUser()`. `getUser()` already cryptographically validated the token;
 * reading the claim back from that validated token's payload is therefore
 * safe and needs no extra verification (and no crypto dependency). Fail-closed:
 * any decode problem yields null => treated as AAL1.
 */
function readAalFromAccessToken(accessToken: string): "aal1" | "aal2" | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      aal?: unknown;
    };
    return claims.aal === "aal1" || claims.aal === "aal2" ? claims.aal : null;
  } catch {
    return null;
  }
}

/**
 * Returns the current request's staff context, or null when the caller is not
 * an active staff member (including "not signed in", "not staff", "unknown
 * role"). Fail-safe: any RPC error also yields null (deny).
 */
export async function getStaffContext(): Promise<StaffContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase.rpc("get_my_staff_context");
  if (error || !data || typeof data !== "object") return null;

  const staff = mapStaffRow(data as StaffMemberRow);
  if (!staff) return null;

  let aal: "aal1" | "aal2" | null = null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    aal = readAalFromAccessToken(session.access_token);
  }
  return { ...staff, aal };
}

/** Coarse gate: signed-in or not. Used by the admin pages via requireStaff. */
export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login?next=/admin");
  }
  return { supabase, user };
}

/** Active staff member or denied. */
export async function requireStaff(): Promise<StaffContext> {
  const staff = await getStaffContext();
  if (!staff || !staff.isActive) {
    redirect("/admin/denied");
  }
  return staff;
}

/** Active staff member holding the given permission, or denied. */
export async function requirePermission(permission: Permission): Promise<StaffContext> {
  const staff = await requireStaff();
  if (!hasPermission(staff.role, permission)) {
    redirect("/admin/denied");
  }
  return staff;
}

/** The owner specifically, or denied. */
export async function requireOwner(): Promise<StaffContext> {
  const staff = await requireStaff();
  if (staff.role !== "owner") {
    redirect("/admin/denied");
  }
  return staff;
}

/**
 * AAL2 enforcement. The assurance level is read from the server-side-validated
 * session JWT (`getUser` verifies the token; the `aal` claim is decoded from
 * that validated token) — a browser claiming "MFA complete" is never
 * sufficient. Redirects the caller to the security page to complete an MFA
 * challenge when the session is only AAL1.
 */
export async function requireAal2(staff: StaffContext): Promise<StaffContext> {
  if (staff.aal !== "aal2") {
    redirect("/admin/security?need_mfa=1");
  }
  return staff;
}

/** Current verified assurance level (no redirects). Used by server actions. */
export async function currentAal(): Promise<"aal1" | "aal2" | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return readAalFromAccessToken(session.access_token);
}
