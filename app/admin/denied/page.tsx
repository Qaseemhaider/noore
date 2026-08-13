import Link from "next/link";

export const metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export default function AdminDeniedPage() {
  return (
    <div className="noore-container flex min-h-[60vh] items-center justify-center py-[var(--space-20)]">
      <div className="max-w-md text-center">
        <p className="type-label mb-3 text-[var(--color-crimson)]">NOORE Admin</p>
        <h1 className="type-page-title">Access denied</h1>
        <p className="mt-4 text-[var(--color-muted)]">
          Your account does not have permission to access the admin area. If you
          believe this is a mistake, contact the store owner.
        </p>
        <div className="mt-8">
          <Link
            prefetch={false}
            href="/"
            className="type-button noore-button--checkout-primary inline-flex min-h-12 items-center justify-center px-6"
          >
            Back to the store
          </Link>
        </div>
      </div>
    </div>
  );
}
