import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { requireEnv } from "@/lib/supabase/env";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];

/**
 * Runs on page navigations. Two jobs:
 *
 * 1. Refresh an expiring session so server-rendered pages receive a valid
 *    token (tokens live in cookies, not localStorage). Refreshing on every
 *    navigation keeps the /account link and protected pages smooth; the check
 *    short-circuits instantly for anonymous visitors (no session cookie).
 * 2. Redirect anonymous users away from /account and authenticated users away
 *    from the auth pages. Plus a COARSE /admin guard: anonymous visitors are
 *    sent to the login page.
 *
 * This is NOT the authorization boundary. Every protected Server Component
 * and Server Action independently calls `supabase.auth.getUser()` + the
 * DB-authoritative staff checks (`lib/admin/authorization.ts`). /admin pages
 * independently verify staff membership, role permissions and (for sensitive
 * actions) AAL2. The proxy guard only prevents the login redirect from
 * happening after a full staff authorization round-trip.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAccountPath =
    pathname === "/account" || pathname.startsWith("/account/");
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!isAccountPath && !isAuthPath && !isAdminPath && !hasSessionCookie) {
    // Anonymous storefront traffic: nothing to refresh or guard.
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, "public">(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

    if (!user && isAccountPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (!user && isAdminPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
