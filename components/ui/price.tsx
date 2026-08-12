import { formatPrice } from "@/lib/format-price";

type PriceProps = {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
};

export function Price({
  amount,
  currency = "PKR",
  locale = "en-PK",
  className = "",
}: PriceProps) {
  return (
    <data
      className={`type-price ${className}`}
      value={(amount / 100).toFixed(2)}
    >
      {formatPrice(amount / 100, currency, locale)}
    </data>
  );
}
