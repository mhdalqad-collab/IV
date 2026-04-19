"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CURRENCIES, type Currency } from "@/lib/currency";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  mounted: boolean;
};

const CurrencyContext = createContext<Ctx>({
  currency: "EUR",
  setCurrency: () => {},
  mounted: false,
});

const STORAGE_KEY = "selk:currency";

export default function CurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (CURRENCIES as string[]).includes(stored)) {
        setCurrencyState(stored as Currency);
      }
    } catch {}
    setMounted(true);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, mounted }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
