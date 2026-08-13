/**
 * Shared auth helpers: safe redirects and friendly, non-enumerating error
 * messages. Nothing here ever prints or exposes raw Supabase error payloads.
 */

/** Default landing page after a successful sign-in. */
export const DEFAULT_AFTER_LOGIN = "/account";

/** Default landing page after a password-reset code exchange. */
export const DEFAULT_AFTER_CONFIRM = "/account";

/**
 * Returns `value` only when it is a same-origin internal path. Rejects open
 * redirects: absolute URLs, protocol-relative URLs, backslashes and anything
 * with a scheme.
 */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback;
  return trimmed;
}

type AuthErrorKind =
  | "sign-in"
  | "sign-up"
  | "sign-out"
  | "forgot-password"
  | "reset-password";

/**
 * Maps Supabase auth errors to generic, user-safe copy. The goal is honest
 * guidance without ever revealing whether an account exists, exposing raw
 * server messages, or hinting at internal state.
 */
export function authErrorMessage(kind: AuthErrorKind, error?: { code?: string; message?: string } | null): string {
  const code = error?.code;
  const message = error?.message?.toLowerCase() ?? "";

  switch (kind) {
    case "sign-in":
      if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
        return "Incorrect email or password. Please try again.";
      }
      if (message.includes("email not confirmed")) {
        return "Please confirm your email address before signing in. Check your inbox for the confirmation link.";
      }
      return "Unable to sign you in. Please try again.";

    case "sign-up":
      // Deliberately uniform: never reveals whether an account already exists.
      return "We were unable to create your account. If you already have an account, please sign in instead.";

    case "forgot-password":
      return "We were unable to send password reset instructions. Please try again.";

    case "reset-password":
      if (message.includes("no session") || code === "session_missing") {
        return "This password reset link is invalid or has expired. Please request a new one.";
      }
      return "We were unable to update your password. Please try again.";

    case "sign-out":
      return "Unable to sign you out. Please try again.";
  }
}
