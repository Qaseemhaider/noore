import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, children, className = "", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={`inline-flex size-11 shrink-0 items-center justify-center transition-colors duration-200 hover:text-[var(--color-crimson)] ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
