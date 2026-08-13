import React from 'react';

interface CheckoutFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function CheckoutField({ label, ...props }: CheckoutFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={props.id} className="block type-label mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full min-h-[var(--space-12)] border border-[var(--color-border)] px-[var(--space-3)] transition-colors focus:border-[var(--color-crimson)] bg-[var(--color-soft-cream)]"
      />
    </div>
  );
}
