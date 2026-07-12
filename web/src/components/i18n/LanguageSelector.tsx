"use client";

import { useLocale } from "./LocaleProvider";
import { LOCALES, LOCALE_LONG_LABELS, type Locale } from "@/lib/i18n";

export default function LanguageSelector() {
  const { locale, setLocale, mounted } = useLocale();
  const value = mounted ? locale : "en";

  return (
    <select
      value={value}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language"
      className="bg-transparent text-white opacity-70 hover:opacity-100 focus:opacity-100 cursor-pointer outline-none text-[13px] font-medium pr-1"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l} className="text-heading">
          {LOCALE_LONG_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
