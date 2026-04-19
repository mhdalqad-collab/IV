"use client";

import { useCurrency } from "./CurrencyProvider";
import { CURRENCIES, type Currency } from "@/lib/currency";

export default function CurrencySelector() {
  const { currency, setCurrency, mounted } = useCurrency();
  const value = mounted ? currency : "EUR";

  return (
    <select
      value={value}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      aria-label="Currency"
      className="bg-transparent text-white opacity-70 hover:opacity-100 focus:opacity-100 cursor-pointer outline-none text-[13px] font-medium pr-1"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c} className="text-heading">
          {c}
        </option>
      ))}
    </select>
  );
}
