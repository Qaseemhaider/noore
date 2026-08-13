"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminLog } from "./audit";
import { currentAal, getStaffContext } from "./authorization";
import { hasPermission } from "./permissions";
import type { StaffRole } from "./types";

/**
 * Phase 5 admin server actions. Every action independently re-verifies
 * authorization from the database — proxy.ts and the browser session are
 * never trusted. Errors are returned as structured results (never raw
 * Supabase payloads) so the UI can render safe status/error announcements.
 */

export type SecurityProbeResult = {
  status: "ok" | "mfa_required" | "denied" | "unauthenticated";
  message: string;
  aal?: "aal1" | "aal2" | null;
};

/**
 * Safe AAL2 enforcement demonstration: requires OWNER + verified AAL2 session
 * and records an MFA_SECURITY_ACTION audit row. It mutates NO business data —
 * the audit write is the only side effect.
 */
export async function runOwnerSecurityProbeAction(): Promise<SecurityProbeResult> {
  const staff = await getStaffContext();
  if (!staff || !staff.isActive) {
    return { status: "unauthenticated", message: "You must be signed in as staff." };
  }
  if (staff.role !== "owner") {
    return { status: "denied", message: "Only the owner may run the AAL2 security probe." };
  }

  const aal = await currentAal();
  if (aal !== "aal2") {
    return {
      status: "mfa_required",
      message: "Owner MFA (AAL2) challenge required before this action.",
      aal,
    };
  }

  await adminLog({
    action: "MFA_SECURITY_ACTION",
    entity: "admin_security",
    data: { probe: "owner_aal2_verified" },
  });

  return { status: "ok", message: "AAL2 verified — security probe recorded in the audit log.", aal };
}

/** Sign out of the admin shell. */
export async function adminSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed_out");
}

/**
 * Invite creation (Phase 5 service foundation). Enforced server-side (owner +
 * AAL2) and again inside the DB function. Returns the one-time raw token to
 * the owner. Not wired to any UI yet (Phase 6 delivery flow).
 */
export type InviteActionResult = {
  status: "ok" | "denied" | "error";
  message: string;
  token?: string;
};

export async function createStaffInviteAction(input: {
  email: string;
  role: Exclude<StaffRole, "owner">;
}): Promise<InviteActionResult> {
  const staff = await getStaffContext();
  if (!staff || !staff.isActive) {
    return { status: "denied", message: "Not authorized." };
  }
  if (staff.role !== "owner" || !hasPermission(staff.role, "staff.manage")) {
    return { status: "denied", message: "Only the owner can invite staff." };
  }
  const aal = await currentAal();
  if (aal !== "aal2") {
    return { status: "denied", message: "Owner MFA (AAL2) challenge required." };
  }

  const { createStaffInvite } = await import("./invites");
  try {
    const { token } = await createStaffInvite(input);
    return {
      status: "ok",
      message: "Invite created. Share the one-time token with the recipient via a secure channel.",
      token,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create invite.",
    };
  }
}
