import { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox(props: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className="size-4 accent-[var(--color-crimson)]"
      {...props}
    />
  );
}
