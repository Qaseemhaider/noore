import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  action,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <header
      className={`flex gap-6 ${align === "center" ? "flex-col items-center text-center" : "items-end justify-between"} ${className}`}
    >
      <div>
        {eyebrow ? (
          <p className="type-label mb-3 text-[var(--color-crimson)]">{eyebrow}</p>
        ) : null}
        <h2 className="type-section-title">{title}</h2>
      </div>
      {action}
    </header>
  );
}
