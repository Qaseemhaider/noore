import React from 'react';
import Link from 'next/link';

export function CheckoutSteps({ currentStep }: { currentStep: 'information' | 'shipping' | 'payment' }) {
  const steps = [
    { name: 'Information', path: '/checkout/information' },
    { name: 'Shipping', path: '/checkout/shipping' },
    { name: 'Payment', path: '/checkout/payment' },
  ];

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isActive = step.path.includes(currentStep);
          const isCompleted = index < steps.findIndex(s => s.path.includes(currentStep));
          
          return (
            <li key={step.name} className="flex items-center">
              {index > 0 && <span className="mx-2 text-ink-muted">/</span>}
              <Link 
                href={isCompleted ? step.path : '#'}
                className={`type-label ${isActive ? 'text-crimson' : isCompleted ? 'text-ink' : 'text-ink-muted'}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {step.name}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
