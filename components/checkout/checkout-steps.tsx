import React from 'react';
import Link from 'next/link';

export function CheckoutSteps({ currentStep }: { currentStep: 'information' | 'shipping' | 'payment' }) {
  const steps = [
    { name: 'Information', path: '/checkout/information' },
    { name: 'Shipping', path: '/checkout/shipping' },
    { name: 'Payment', path: '/checkout/payment' },
  ];

  const currentIndex = steps.findIndex(s => s.path.includes(currentStep));

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <li key={step.name} className="flex items-center">
              {index > 0 && <span aria-hidden="true" className="mx-2 text-[var(--color-muted)]">/</span>}
              {isCompleted ? (
                <Link
                  href={step.path}
                  className="type-label text-[var(--color-obsidian)]"
                >
                  {step.name}
                </Link>
              ) : (
                <span
                  className={`type-label ${isActive ? 'text-[var(--color-crimson)]' : 'text-[var(--color-muted)]'}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {step.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
