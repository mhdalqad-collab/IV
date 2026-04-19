export type Currency = "EUR" | "USD" | "OMR";

export const CURRENCIES: Currency[] = ["EUR", "USD", "OMR"];

// Stored prices are in EUR. Rates = target units per 1 EUR.
export const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  OMR: 0.42,
};

export const SYMBOLS: Record<Currency, string> = {
  EUR: "\u20AC",
  USD: "$",
  OMR: "OMR",
};

export function convert(amountEUR: number, to: Currency): number {
  return amountEUR * RATES[to];
}

export function formatPrice(
  amountEUR: number,
  currency: Currency,
  decimals?: number
): string {
  const value = convert(amountEUR, currency);
  const d = decimals ?? (currency === "OMR" ? 3 : value < 10 ? 2 : 0);
  const formatted = new Intl.NumberFormat("en", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
  if (currency === "OMR") return `${formatted} OMR`;
  return `${SYMBOLS[currency]}${formatted}`;
}
