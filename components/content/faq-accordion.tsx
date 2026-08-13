"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

type FaqAccordionProps = {
  items: FaqItem[];
  id: string;
};

export function FaqAccordion({ items, id }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${id}-button-${index}`;
        const panelId = `${id}-panel-${index}`;
        return (
          <div key={item.question} className="border-b border-[var(--color-border)] first:border-t">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="type-navigation flex w-full items-center justify-between gap-4 py-[var(--space-4)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
              >
                {item.question}
                <span
                  aria-hidden="true"
                  className={`text-[var(--color-crimson)] transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-200 ease-[var(--ease-standard)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="max-w-[65ch] pb-[var(--space-5)] text-[var(--color-muted)]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
