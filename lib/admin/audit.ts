import "server-only";

import { createClient } from "@/lib/supabase/server";

type AdminLogInput = {
  action: string;
  entity?: string;
  entityId?: string;
  data?: Json;
};

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Writes an append-only admin audit row. The hardened DB function
 * `admin_log` re-verifies the caller is an ACTIVE staff member and stamps
 * `actor_id` + `role_snapshot` from `auth.uid()` — never from this input.
 * Callers must already be authorized; this is the "log what you are about to
 * do / did" helper, and it fails loudly rather than silently dropping rows.
 *
 * Never pass secrets here: no passwords, TOTP secrets, session/access tokens,
 * service keys or payment credentials.
 */
export async function adminLog(input: AdminLogInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_log", {
    p_action: input.action,
    ...(input.entity ? { p_entity: input.entity } : {}),
    ...(input.entityId ? { p_entity_id: input.entityId } : {}),
    ...(input.data ? { p_data: input.data } : {}),
  });
  if (error) {
    throw new Error(`audit write failed: ${error.message}`);
  }
}
