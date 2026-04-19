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
  // Render EUR on server + first client render to avoid hydration mismatch,
  // then swap to user's choice after mount.
  const display = formatPrice(amount, mounted ? currency : "EUR", decimals);
  return <span className={className}>{display}</span>;
}
