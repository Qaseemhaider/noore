import Link from "next/link";
import { ChevronIcon } from "@/components/icons";
import { primaryNavigation, shopNavigation } from "@/lib/navigation";

export function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden lg:block">
      <ul className="flex items-center gap-8 xl:gap-10">
        {primaryNavigation.map((item) =>
          item.label === "Shop" ? (
            <li key={item.href} className="relative">
              <details className="group">
                <summary className="type-navigation flex min-h-11 list-none cursor-pointer items-center gap-1 border-b border-transparent transition-colors hover:text-[var(--color-crimson)] group-open:border-[var(--color-crimson)] group-open:text-[var(--color-crimson)] [&::-webkit-details-marker]:hidden">
                  Shop
                  <ChevronIcon className="rotate-90 transition-transform group-open:-rotate-90" />
                </summary>
                <div className="absolute left-0 top-full z-[var(--z-header)] min-w-48 border border-[var(--color-border)] bg-[var(--color-soft-cream)] p-3 shadow-[0_16px_36px_rgba(18,18,18,0.12)]">
                  <ul>
                    {shopNavigation.map((shopItem) => (
                      <li key={shopItem.href}>
                        <Link
                          prefetch={false}
                          href={shopItem.href}
                          className="type-navigation flex min-h-11 items-center px-3 transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-crimson)]"
                        >
                          {shopItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ) : (
            <li key={item.href}>
              <Link
                prefetch={false}
                className="type-navigation flex min-h-11 items-center border-b border-transparent transition-colors hover:border-[var(--color-crimson)] hover:text-[var(--color-crimson)]"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
