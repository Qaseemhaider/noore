type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  return (
    <details open={defaultOpen} className="group border-b border-[var(--color-line)]">
      <summary className="flex cursor-pointer items-center justify-between py-[var(--space-4)] text-[var(--color-ink)] type-navigation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2">
        {title}
        <span className="group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="pb-[var(--space-4)] text-[var(--text-body)] text-[var(--color-muted)]">{children}</div>
    </details>
  );
}
