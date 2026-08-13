import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="noore-container py-[var(--space-24)] text-center">
      <p className="type-label mb-[var(--space-4)] text-[var(--color-crimson)]">404</p>
      <h1 className="type-page-title mb-[var(--space-6)]">Page not found</h1>
      <p className="mb-[var(--space-8)] text-[var(--color-muted)]">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-[var(--space-4)]">
        <ButtonLink href="/" variant="primary">
          Return Home
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline">
          Shop
        </ButtonLink>
      </div>
    </div>
  );
}
