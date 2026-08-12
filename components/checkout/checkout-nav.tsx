'use client';

import Link from "next/link";

const secondaryClasses =
  "type-button inline-flex items-center justify-center transition-colors duration-200 noore-button--checkout-secondary w-full sm:w-auto";

const primaryClasses =
  "type-button inline-flex items-center justify-center transition-colors duration-200 noore-button--checkout-primary w-full sm:w-auto";

interface CheckoutNavProps {
  backLabel: string;
  backHref?: string;
  backOnClick?: () => void;
  continueLabel: string;
}

export function CheckoutNav({
  backLabel,
  backHref,
  backOnClick,
  continueLabel,
}: CheckoutNavProps) {
  const back = backHref ? (
    <Link href={backHref} prefetch={false} className={secondaryClasses}>
      {backLabel}
    </Link>
  ) : (
    <button type="button" onClick={backOnClick} className={secondaryClasses}>
      {backLabel}
    </button>
  );

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {back}
      <button type="submit" className={primaryClasses}>
        {continueLabel}
      </button>
    </div>
  );
}
