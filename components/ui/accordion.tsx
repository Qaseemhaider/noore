type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  return (
    <details open={defaultOpen} className="group border-b border-[var(--color-line)]">
      <summary className="flex cursor-pointer items-center justify-between py-4 text-[var(--color-ink)] type-navigation">
        {title}
        <span className="group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
