import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import styles from "./support-page.module.css";

type SupportPageHeroProps = {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
};

export function SupportPageHero({ eyebrow, title, intro }: SupportPageHeroProps) {
  return (
    <section className="border-b border-[var(--color-border)]" aria-labelledby="support-hero-title">
      <Container className="py-[var(--space-16)] md:py-[var(--space-24)]">
        <Reveal>
          <p className="type-label mb-3 text-[var(--color-crimson)]">{eyebrow}</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 id="support-hero-title" className="type-page-title max-w-[22ch]">
            {title}
          </h1>
        </Reveal>
        {intro ? (
          <Reveal delay={160}>
            <p className="mt-6 max-w-[65ch] text-lg text-[var(--color-muted)]">{intro}</p>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}

type SupportSectionProps = {
  eyebrow?: string;
  title: string;
  id?: string;
  children: ReactNode;
  contentClassName?: string;
};

export function SupportSection({
  eyebrow,
  title,
  id,
  children,
  contentClassName = "",
}: SupportSectionProps) {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby={titleId}>
      <Container className="py-[var(--space-16)] md:py-[var(--space-20)]">
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={<span id={titleId}>{title}</span>}
          />
        </Reveal>
        <Reveal delay={100}>
          <div className={`${styles.content} mt-8 max-w-[65ch] ${contentClassName}`}>
            {children}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
