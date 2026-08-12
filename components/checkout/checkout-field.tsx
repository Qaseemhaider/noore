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
        className="w-full border border-line p-2 focus:border-crimson outline-none"
      />
    </div>
  );
}
