import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/update-session";

/**
 * NOORE request proxy (Next.js 16 replacement for middleware).
 *
 * Refreshes the Supabase session cookie on navigation and guards the
 * /account and auth routes. The storefront is never redirected here, and this
 * is NOT an authorization boundary — protected routes verify identity with
 * `supabase.auth.getUser()` themselves.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on page navigations but skip static assets, image optimization,
    // metadata files and public files.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)",
  ],
};
