import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { DEFAULT_AFTER_LOGIN, safeRedirectPath } from "@/lib/auth/utils";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NOORE account to view orders and manage your details.",
  robots: { index: false, follow: false },
};

const STATUS_MESSAGES: Record<string, string> = {
  password_updated: "Your password has been updated. Please sign in with your new password.",
  signed_out: "You have been signed out.",
  invalid_link: "This link is invalid or has expired.",
};

export default async function LoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; status?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const returnTo = safeRedirectPath(next ?? null, DEFAULT_AFTER_LOGIN);
  const statusMessage = status ? STATUS_MESSAGES[status] ?? null : null;

  return (
    <AuthShell
      eyebrow="Account"
      title="Sign in"
      lead="Welcome back. Enter your details to continue to your account."
    >
      <LoginForm returnTo={returnTo} statusMessage={statusMessage} />
    </AuthShell>
  );
}
