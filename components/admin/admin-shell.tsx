import Link from "next/link";
import type { StaffContext } from "@/lib/admin/types";
import { hasPermission } from "@/lib/admin/permissions";
import type { Permission } from "@/lib/admin/permissions";
import { adminSignOutAction } from "@/lib/admin/actions";

type NavEntry = {
  href: string;
  label: string;
  permission?: Permission;
  phase?: string;
};

const NAV_ENTRIES: NavEntry[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products", permission: "catalog.view", phase: "Phase 6" },
  { href: "/admin/products/new", label: "New Product", permission: "catalog.edit", phase: "Phase 6" },
  { href: "/admin/inventory", label: "Inventory", permission: "inventory.edit", phase: "Phase 6" },
  { href: "/admin/categories", label: "Categories", permission: "catalog.view", phase: "Phase 6" },
  { href: "/admin/colors", label: "Colors", permission: "catalog.view", phase: "Phase 6" },
  { href: "/admin/sizes", label: "Sizes", permission: "catalog.view", phase: "Phase 6" },
  { href: "/admin/reviews", label: "Reviews", permission: "reviews.moderate", phase: "Future" },
  { href: "/admin/content", label: "Content", permission: "content.edit", phase: "Future" },
  { href: "/admin/seo", label: "SEO", permission: "seo.edit", phase: "Future" },
  { href: "/admin/staff", label: "Staff", permission: "staff.manage", phase: "Future" },
  { href: "/admin/security", label: "Security", permission: "security.manage" },
];

function roleLabel(role: StaffContext["role"]): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "store_manager":
      return "Store manager";
    case "seo_editor":
      return "SEO editor";
    case "support":
      return "Support";
  }
}

export function AdminShell({
  staff,
  children,
}: {
  staff: StaffContext;
  children: React.ReactNode;
}) {
  const visible = NAV_ENTRIES.filter(
    (entry) => !entry.permission || hasPermission(staff.role, entry.permission),
  );

  const sidebarNav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {visible.map((entry) => {
        if (entry.phase === "Phase 6") {
          // Implemented Phase 6 items use clickable Links
          return (
            <Link
              key={entry.href}
              href={entry.href}
              prefetch={false}
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--color-obsidian)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
            >
              {entry.label}
            </Link>
          );
        }
        if (entry.phase === "Future") {
          // Future items show as disabled placeholders
          return (
            <span
              key={entry.href}
              aria-disabled="true"
              className="flex items-center justify-between gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--color-muted)]"
            >
              {entry.label}
              <span className="type-meta text-[0.65rem] uppercase tracking-wide">
                {entry.phase}
              </span>
            </span>
          );
        }
        // No phase tag = always-implemented nav item
        return (
          <Link
            key={entry.href}
            href={entry.href}
            prefetch={false}
            className="rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--color-obsidian)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--color-warm-ivory)] text-[var(--color-obsidian)]">
      <aside className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="noore-container flex items-center gap-4 py-4">
          <div className="shrink-0">
            <p className="type-label text-[var(--color-crimson)]">NOORE</p>
            <p className="type-meta">Admin</p>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            {sidebarNav}
          </div>
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="max-w-[14rem] truncate text-sm font-semibold">
                {staff.displayName ?? staff.email}
              </p>
              <p className="type-meta">
                {roleLabel(staff.role)} · {staff.aal ?? "AAL1"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-[calc(100vh-5rem)]">
        <div className="noore-container py-[var(--space-10)] md:py-[var(--space-12)]">
          {children}
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="noore-container flex flex-wrap items-center justify-between gap-4 py-5">
          <p className="type-meta">
            Signed in as <span className="font-semibold text-[var(--color-obsidian)]">{staff.email}</span> ·{" "}
            {roleLabel(staff.role)}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              prefetch={false}
              href="/"
              className="type-button text-[var(--color-crimson)] hover:text-[var(--color-crimson-hover)]"
            >
              View store
            </Link>
            <form action={adminSignOutAction}>
              <button
                type="submit"
                className="type-button px-3 py-2 text-[var(--color-obsidian)] underline underline-offset-3 hover:text-[var(--color-crimson)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
