"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { displayNameSchema, emailSchema, passwordSchema } from "@/lib/auth/validation";
import { authErrorMessage } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { errorClass, inputClass, labelClass } from "./form-styles";

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function handleChange(
    field: "fullName" | "email" | "password",
    value: string,
  ) {
    if (field === "fullName") setFullName(value);
    else if (field === "email") setEmail(value);
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

    const nameResult = displayNameSchema.safeParse(fullName);
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!nameResult.success) {
      nextFieldErrors.fullName = "Please enter your full name.";
    }
    if (!emailResult.success) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }
    if (!passwordResult.success) {
      nextFieldErrors.password = "Password must be at least 6 characters.";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;
    if (!nameResult.success || !emailResult.success || !passwordResult.success) return;

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: emailResult.data,
      password: passwordResult.data,
      options: {
        data: { display_name: nameResult.data },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/account`,
      },
    });
    setSubmitting(false);

    if (error) {
      setError(authErrorMessage("sign-up", error));
      return;
    }

    if (data.session) {
      // Confirmation is disabled for this project — straight into the account.
      router.push("/account");
      router.refresh();
      return;
    }

    if (data.user) {
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <div role="status" className="max-w-[32rem]">
        <p className="text-[var(--color-obsidian)]">
          Almost done — please check your inbox to confirm your email address.
        </p>
        <p className="mt-3 text-[var(--color-muted)]">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-semibold text-[var(--color-obsidian)]">{email}</span>.
          Once you confirm, you can sign in to your NOORE account.
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Didn&apos;t receive it? Check your spam folder, then{" "}
          <Link
            prefetch={false}
            href="/login"
            className="text-[var(--color-crimson)] underline underline-offset-3"
          >
            sign in
          </Link>{" "}
          or{" "}
          <Link
            prefetch={false}
            href="/forgot-password"
            className="text-[var(--color-crimson)] underline underline-offset-3"
          >
            request a new link
          </Link>
          .
        </p>
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
          <label htmlFor="signup-name" className={labelClass}>
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            aria-invalid={fieldErrors.fullName ? true : undefined}
            aria-describedby={fieldErrors.fullName ? "signup-name-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.fullName ? (
            <p id="signup-name-error" className={errorClass}>
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-email" className={labelClass}>
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => handleChange("email", event.target.value)}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.email ? (
            <p id="signup-email-error" className={errorClass}>
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="signup-password" className={labelClass}>
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(event) => handleChange("password", event.target.value)}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.password ? (
            <p id="signup-password-error" className={errorClass}>
              {fieldErrors.password}
            </p>
          ) : (
            <p className="type-meta mt-2">
              At least 6 characters.
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 min-w-44 noore-button--auth-primary"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
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
