export function formatPrice(
  amount: number,
  currency = "PKR",
  locale = "en-PK",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount);
}
