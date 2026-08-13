import Link from "next/link";
import { requireStaff } from "@/lib/admin/authorization";
import { rolePermissions } from "@/lib/admin/permissions";

function roleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "store_manager":
      return "Store manager";
    case "seo_editor":
      return "SEO editor";
    case "support":
      return "Support";
    default:
      return role;
  }
}

export default async function AdminOverviewPage() {
  const staff = await requireStaff();

  const permissions = rolePermissions(staff.role);
  const pendingModules = [
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/reviews", label: "Reviews" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/seo", label: "SEO" },
    { href: "/admin/staff", label: "Staff" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <p className="type-label mb-3 text-[var(--color-crimson)]">Admin</p>
      <h1 className="type-page-title">Overview</h1>

      <dl className="mt-8 grid max-w-[42rem] gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="type-meta font-semibold">Name</dt>
          <dd className="mt-1">{staff.displayName ?? "—"}</dd>
        </div>
        <div>
          <dt className="type-meta font-semibold">Email</dt>
          <dd className="mt-1">{staff.email}</dd>
        </div>
        <div>
          <dt className="type-meta font-semibold">Role</dt>
          <dd className="mt-1">{roleLabel(staff.role)}</dd>
        </div>
        <div>
          <dt className="type-meta font-semibold">Session assurance</dt>
          <dd className="mt-1">
            {staff.aal === "aal2" ? (
              <span className="font-semibold text-[var(--color-obsidian)]">AAL2 (MFA verified)</span>
            ) : (
              <Link
                prefetch={false}
                href="/admin/security?need_mfa=1"
                className="font-semibold text-[var(--color-crimson)] underline underline-offset-3"
              >
                AAL1 — MFA challenge needed
              </Link>
            )}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="permissions-title" className="mt-10">
        <h2 id="permissions-title" className="type-section-title">Permissions</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <li
              key={permission}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-muted)]"
            >
              {permission}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="modules-title" className="mt-10">
        <h2 id="modules-title" className="type-section-title">
          Management modules
        </h2>
        <p className="type-meta mt-3">
          These arrive in later phases. Until then they are locked placeholders.
        </p>
        <ul className="mt-4 grid max-w-[42rem] gap-3 sm:grid-cols-2">
          {pendingModules.map((module) => (
            <li
              key={module.href}
              className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
            >
              <span className="font-semibold">{module.label}</span>
              <span className="type-meta text-[0.65rem] uppercase tracking-wide">Phase 6</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="security-title" className="mt-10">
        <h2 id="security-title" className="type-section-title">Security</h2>
        <p className="type-meta mt-3">
          Enroll and manage your authenticator, and verify your AAL2 session.
        </p>
        <div className="mt-4">
          <Link
            prefetch={false}
            href="/admin/security"
            className="type-button noore-button--checkout-primary inline-flex min-h-12 items-center justify-center px-6"
          >
            Open security settings
          </Link>
        </div>
      </section>
    </div>
  );
}
