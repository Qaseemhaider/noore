"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { passwordSchema } from "@/lib/auth/validation";
import { authErrorMessage } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { errorClass, inputClass, labelClass } from "./form-styles";

/**
 * Reached after the email link → /auth/confirm code exchange, which restores a
 * valid session. Without a session the update fails gracefully with a generic
 * "link invalid or expired" message.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: "password" | "confirm", value: string) {
    if (field === "password") setPassword(value);
    else setConfirm(value);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const passwordResult = passwordSchema.safeParse(password);
    const nextFieldErrors: typeof fieldErrors = {};
    if (!passwordResult.success) {
      nextFieldErrors.password = "Password must be at least 6 characters.";
    }
    if (password !== confirm) {
      nextFieldErrors.confirm = "Passwords do not match.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordResult.data,
    });
    setSubmitting(false);

    if (error) {
      setError(authErrorMessage("reset-password", error));
      return;
    }

    // Invalidate the session so the user signs in again with the new password.
    await supabase.auth.signOut();
    router.push("/login?status=password_updated");
    router.refresh();
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
          <label htmlFor="reset-password" className={labelClass}>
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(event) => handleChange("password", event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.password ? (
            <p id="reset-password-error" className={errorClass}>
              {fieldErrors.password}
            </p>
          ) : (
            <p className="type-meta mt-2">At least 6 characters.</p>
          )}
        </div>

        <div>
          <label htmlFor="reset-confirm" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="reset-confirm"
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => handleChange("confirm", event.target.value)}
            aria-invalid={fieldErrors.confirm ? true : undefined}
            aria-describedby={fieldErrors.confirm ? "reset-confirm-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.confirm ? (
            <p id="reset-confirm-error" className={errorClass}>
              {fieldErrors.confirm}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-2 min-w-44 noore-button--auth-primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
        Changed your mind?{" "}
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
