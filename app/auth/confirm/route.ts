import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_AFTER_CONFIRM, safeRedirectPath } from "@/lib/auth/utils";

/**
 * Handles the links Supabase emails (email confirmation and password reset).
 * Exchanges the one-time code for a session, then redirects to the `next`
 * path. The destination is validated against open redirects, so `next` can
 * only ever be a same-origin internal path.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?status=invalid_link", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?status=invalid_link", origin));
  }

  const destination = safeRedirectPath(next, DEFAULT_AFTER_CONFIRM);
  return NextResponse.redirect(new URL(destination, origin));
}
