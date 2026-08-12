import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="NOORE home"
      className={`inline-flex min-h-11 items-center font-serif text-[2rem] font-medium leading-none tracking-[-0.04em] ${className}`}
    >
      NOORE
    </Link>
  );
}
