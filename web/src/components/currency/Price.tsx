"use client";

import { useCurrency } from "./CurrencyProvider";
import { formatPrice } from "@/lib/currency";

export default function Price({
  amount,
  decimals,
  className,
}: {
  amount: number;
  decimals?: number;
  className?: string;
}) {
  const { currency, mounted } = useCurrency();
  // Render OMR (the stored base) on server + first client render to avoid a
  // hydration mismatch, then swap to the user's choice after mount.
  const display = formatPrice(amount, mounted ? currency : "OMR", decimals);
  return <span className={className}>{display}</span>;
}
