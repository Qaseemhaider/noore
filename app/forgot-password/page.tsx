import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your NOORE account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordRoute() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Forgot your password?"
      lead="Enter the email you used to create your account and we'll send you a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
