import en, { type Dictionary } from "./en";
import ar from "./ar";

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
};

export const LOCALE_LONG_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

type PathInto<T> = T extends string
  ? ""
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${PathInto<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = PathInto<Dictionary>;

export function translate(
  dict: Dictionary,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let value: unknown = dict;
  for (const p of parts) {
    if (value && typeof value === "object" && p in (value as object)) {
      value = (value as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

export { en };
