import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
};

/**
 * Editorial two-column auth layout: a restrained brand statement on the left
 * (large screens) and the form on the right. Deliberately not a boxed card —
 * it follows the NOORE support-page language.
 */
export function AuthShell({ eyebrow, title, lead, children }: AuthShellProps) {
  return (
    <div className="border-b border-[var(--color-border)]">
      <Container className="grid gap-12 py-[var(--space-16)] md:py-[var(--space-20)] lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-24">
        <aside className="hidden flex-col justify-between border-t border-[var(--color-champagne)] pt-8 lg:flex" aria-hidden="true">
          <div>
            <p className="type-label mb-5 text-[var(--color-crimson)]">NOORE</p>
            <p className="max-w-[24ch] text-[1.75rem] leading-[1.25] [font-family:var(--font-display)]">
              &ldquo;Modesty is not the absence of self-expression — it is the
              most considered kind.&rdquo;
            </p>
          </div>
          <p className="type-meta max-w-[36ch]">
            One account across NOORE: your orders, addresses and preferences,
            in one place.
          </p>
        </aside>

        <div className="max-w-[30rem]">
          <p className="type-label mb-3 text-[var(--color-crimson)]">{eyebrow}</p>
          <h1 className="type-page-title">{title}</h1>
          {lead ? (
            <p className="mt-4 text-[var(--color-muted)]">{lead}</p>
          ) : null}
          <div className="mt-10">{children}</div>
        </div>
      </Container>
    </div>
  );
}
