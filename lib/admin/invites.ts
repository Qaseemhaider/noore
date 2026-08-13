import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "./types";

/**
 * Staff invitation service layer (Phase 5 foundation; the owner-only UI is
 * Phase 6). All privilege enforcement happens inside the SECURITY DEFINER
 * functions in the database:
 *
 *   create_staff_invite(email, role)
 *     - caller must be an ACTIVE staff member, role = owner, session AAL2
 *     - role allow-listed (store_manager | seo_editor | support, never owner)
 *     - returns the raw 256-bit token EXACTLY once; only its sha-256 hash is
 *       stored; expires in 48h; rejects duplicates / existing staff
 *   consume_staff_invite(token, email)
 *     - validates hash, expiry, one-time usage and that the signed-in user's
 *       email matches the invite, then creates the staff member
 *
 * These wrappers add no authority of their own — they only shape the DB call.
 */

export type CreatedStaffInvite = {
  inviteId: string;
  token: string;
};

export async function createStaffInvite(input: {
  email: string;
  role: Exclude<StaffRole, "owner">;
}): Promise<CreatedStaffInvite> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_staff_invite", {
    p_email: input.email.trim(),
    p_role: input.role,
  });
  if (error) {
    throw new Error(error.message);
  }
  const row = Array.isArray(data) ? data[0] : undefined;
  if (!row || typeof row.token !== "string") {
    throw new Error("invite creation failed");
  }
  return { inviteId: row.invite_id, token: row.token };
}

export async function consumeStaffInvite(token: string, email: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_staff_invite", {
    p_token: token.trim(),
    p_email: email.trim(),
  });
  if (error) {
    throw new Error(error.message);
  }
  return String(data ?? "");
}
