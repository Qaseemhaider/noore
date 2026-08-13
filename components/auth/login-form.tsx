"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/auth/validation";
import {
  authErrorMessage,
  DEFAULT_AFTER_LOGIN,
  safeRedirectPath,
} from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { errorClass, inputClass, labelClass } from "./form-styles";

type LoginFormProps = {
  returnTo: string;
  statusMessage: string | null;
};

export function LoginForm({ returnTo, statusMessage }: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: "email" | "password", value: string) {
    if (field === "email") setEmail(value);
    else setPassword(value);
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

    const emailResult = emailSchema.safeParse(email);
    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!emailResult.success) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }
    if (!password.trim()) {
      nextFieldErrors.password = "Please enter your password.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;
    if (!emailResult.success) return;

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailResult.data,
      password,
    });
    setSubmitting(false);

    if (error) {
      setError(authErrorMessage("sign-in", error));
      return;
    }

    router.push(safeRedirectPath(returnTo, DEFAULT_AFTER_LOGIN));
    router.refresh();
  }

  return (
    <>
      {statusMessage ? (
        <p role="status" className="mb-6 border border-[var(--color-champagne)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-obsidian)]">
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className={`mb-6 ${errorClass} text-sm`}>
          {error}
        </p>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => handleChange("email", event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <p id="login-email-error" className={errorClass}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={labelClass}>
              Password
            </label>
            <Link
              prefetch={false}
              href="/forgot-password"
              className="type-meta mb-2 text-[var(--color-crimson)] underline underline-offset-3"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => handleChange("password", event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={
              fieldErrors.password ? "login-password-error" : undefined
            }
            className={inputClass}
          />
          {fieldErrors.password ? (
            <p id="login-password-error" className={errorClass}>
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="mt-2 min-w-44 noore-button--auth-primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
        New to NOORE?{" "}
        <Link
          prefetch={false}
          href="/signup"
          className="font-semibold text-[var(--color-obsidian)] underline underline-offset-3"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
