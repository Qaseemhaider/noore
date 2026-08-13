"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/lib/account-actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <SignOutSubmit />
    </form>
  );
}

function SignOutSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="type-button min-h-11 px-3 text-[var(--color-crimson)] underline underline-offset-3 hover:text-[var(--color-crimson-hover)]"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
