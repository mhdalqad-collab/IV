"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_DIR,
  type Locale,
  type TranslationKey,
  getDictionary,
  translate,
} from "@/lib/i18n";

export const LOCALE_STORAGE_KEY = "selk:locale";
export const LOCALE_COOKIE = "selk_locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  mounted: boolean;
};

const LocaleContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => k,
  dir: "ltr",
  mounted: false,
});

function writeLocaleCookie(l: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {}
}

export default function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dir = LOCALE_DIR[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {}
    writeLocaleCookie(l);
    // Trigger server re-render so server components localize too.
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(dict, key, vars),
    [dict]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dir: LOCALE_DIR[locale], mounted }),
    [locale, setLocale, t, mounted]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  return useContext(LocaleContext).t;
}
