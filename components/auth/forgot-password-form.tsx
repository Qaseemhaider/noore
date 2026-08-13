"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/auth/validation";
import { authErrorMessage } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { errorClass, inputClass, labelClass } from "./form-styles";

/**
 * Anti-enumeration: the user is shown the same confirmation message whether or
 * not the account exists, so the form never leaks registered addresses.
 */
export function ForgotPasswordForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setFieldError("Please enter a valid email address.");
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      emailResult.data,
      { redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password` },
    );
    setSubmitting(false);

    if (error) {
      setError(authErrorMessage("forgot-password", error));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="max-w-[32rem]">
        <p className="text-[var(--color-obsidian)]">
          If an account exists for that email, password reset instructions are
          on their way.
        </p>
        <p className="mt-3 text-[var(--color-muted)]">
          Check your inbox (and spam folder) for a link to reset your password.
          The link expires after a short time.
        </p>
        <div className="mt-6">
          <Link
            prefetch={false}
            href="/login"
            className="text-[var(--color-crimson)] underline underline-offset-3"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <p role="alert" className={`mb-6 ${errorClass} text-sm`}>
          {error}
        </p>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="forgot-email" className={labelClass}>
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldError(null);
            }}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "forgot-email-error" : undefined}
            className={inputClass}
          />
          {fieldError ? (
            <p id="forgot-email-error" className={errorClass}>
              {fieldError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-2 min-w-44 noore-button--auth-primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Sending…" : "Send reset instructions"}
        </Button>
      </form>

      <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
        Remembered it?{" "}
        <Link
          prefetch={false}
          href="/login"
          className="font-semibold text-[var(--color-obsidian)] underline underline-offset-3"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
