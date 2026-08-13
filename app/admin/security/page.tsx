import type { Metadata } from "next";
import { Aal2Probe } from "@/components/admin/aal2-probe";
import { MfaManager } from "@/components/admin/mfa-manager";
import { requireStaff } from "@/lib/admin/authorization";

export const metadata: Metadata = {
  title: "Admin · Security",
  robots: { index: false, follow: false },
};

export default async function AdminSecurityPage() {
  const staff = await requireStaff();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Security</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Protect your account and verify the current session&apos;s authentication
        assurance level.
      </p>

      <div className="mt-10 grid gap-8">
        <MfaManager initialAal={staff.aal} isOwner={staff.role === "owner"} />
        {staff.role === "owner" ? <Aal2Probe /> : null}
      </div>
    </div>
  );
}
