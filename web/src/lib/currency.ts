export type Currency = "OMR" | "EUR" | "USD";

export const CURRENCIES: Currency[] = ["OMR", "EUR", "USD"];

// Stored prices are in OMR (Omani Rial). Rates = target units per 1 OMR.
// Derived from 1 EUR = 0.42 OMR and 1 EUR = 1.08 USD.
export const RATES: Record<Currency, number> = {
  OMR: 1,
  EUR: 2.381, // 1 OMR ~= EUR 2.381  (1 / 0.42)
  USD: 2.571, // 1 OMR ~= USD 2.571  (1.08 / 0.42)
};

export const SYMBOLS: Record<Currency, string> = {
  EUR: "\u20AC",
  USD: "$",
  OMR: "OMR",
};

export function convert(amountOMR: number, to: Currency): number {
  return amountOMR * RATES[to];
}

export function formatPrice(
  amountOMR: number,
  currency: Currency,
  decimals?: number
): string {
  const value = convert(amountOMR, currency);
  const d = decimals ?? (currency === "OMR" ? 3 : value < 10 ? 2 : 0);
  const formatted = new Intl.NumberFormat("en", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
  if (currency === "OMR") return `${formatted} OMR`;
  return `${SYMBOLS[currency]}${formatted}`;
}
