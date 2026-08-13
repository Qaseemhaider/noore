import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { requireEnv } from "@/lib/supabase/env";

/**
 * Creates a Supabase client bound to the current request's cookies.
 *
 * Use in Server Components, Server Actions and Route Handlers. Callers must
 * still verify identity with `supabase.auth.getUser()` and scope every query
 * to `auth.uid()` — RLS is the security boundary, never this helper.
 *
 * Cookie writes are swallowed in Server Components (where setting cookies is
 * not allowed); session refreshes happen in proxy.ts so pages always see a
 * valid token.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, "public">(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component when cookies cannot be set here.
            // proxy.ts refreshes the session on navigation, so this is safe.
          }
        },
      },
    }
  );
}
