import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a NOORE account to manage orders, addresses and preferences.",
  robots: { index: false, follow: false },
};

export default function SignupRoute() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      lead="Join NOORE to keep your orders, addresses and preferences in one place."
    >
      <SignupForm />
    </AuthShell>
  );
}
