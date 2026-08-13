type SupabaseEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

export function requireEnv(key: SupabaseEnvKey): string {
  const value =
    key === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : key === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
        ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        : process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error(
      `Missing Supabase environment variable ${key}. Add it to .env.local (see .env.example).`
    );
  }
  return value;
}
