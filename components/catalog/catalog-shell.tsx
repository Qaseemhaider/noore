import { Container } from "@/components/ui/container";
import { FilterPanel } from "./filter-panel";
import { MobileFilterDrawer } from "./mobile-filter-drawer";

type CatalogShellProps = {
  title: string;
  resultCount: number;
  children: React.ReactNode;
};

export function CatalogShell({ title, resultCount, children }: CatalogShellProps) {
  return (
    <Container className="py-[var(--space-12)]">
      <header className="mb-[var(--space-12)]">
        <h1 className="font-serif text-[var(--text-page-title)] mb-[var(--space-4)]">{title}</h1>
        <p className="text-[var(--text-meta)] text-[var(--color-muted)]">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
      </header>
      <MobileFilterDrawer />
      <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-[var(--space-12)]">
        <aside className="hidden lg:block">
            <FilterPanel />
        </aside>
        <main>
          {children}
        </main>
      </div>
    </Container>
  );
}
