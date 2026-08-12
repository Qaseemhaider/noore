import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "noore-button--primary",
  dark: "noore-button--dark",
  outline: "noore-button--outline",
} as const;

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`type-button inline-flex min-h-11 items-center justify-center px-6 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = SharedProps & { href: string };

export function ButtonLink({
  children,
  className = "",
  variant = "primary",
  href,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`type-button inline-flex min-h-11 items-center justify-center px-6 transition-colors duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
