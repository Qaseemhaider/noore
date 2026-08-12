'use client';
import { Accordion } from "@/components/ui/accordion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function FilterPanel() {
  const searchParams = useSearchParams();

  const getUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)] text-[var(--text-body)]">
      <Accordion title="Category" defaultOpen>
        <div className="flex flex-col gap-[var(--space-2)]">
           <Link href={getUrl("category", "abayas")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">Abayas</Link>
           <Link href={getUrl("category", "hijabs")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">Hijabs</Link>
           <Link href={getUrl("category", "chadars")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">Chadars</Link>
        </div>
      </Accordion>
      <Accordion title="Size">
        <div className="flex flex-col gap-[var(--space-2)]">
           <Link href={getUrl("size", "S")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">S</Link>
           <Link href={getUrl("size", "M")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">M</Link>
           <Link href={getUrl("size", "L")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">L</Link>
           <Link href={getUrl("size", "XL")} className="text-[var(--color-muted)] hover:text-[var(--color-crimson)]">XL</Link>
        </div>
      </Accordion>
    </div>
  );
}
