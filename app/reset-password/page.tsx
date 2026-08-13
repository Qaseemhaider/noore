import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your NOORE account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordRoute() {
  return (
    <AuthShell
      eyebrow="Account"
      title="Choose a new password"
      lead="Your identity was verified by the link we emailed you. Set a new password below."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
