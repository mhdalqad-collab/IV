import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  type TranslationKey,
  getDictionary,
  translate,
} from "./index";

export const LOCALE_COOKIE = "selk_locale";

export async function getServerLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const v = store.get(LOCALE_COOKIE)?.value;
    if (v && (LOCALES as readonly string[]).includes(v)) return v as Locale;
  } catch {}
  return DEFAULT_LOCALE;
}

export async function getServerT() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  return {
    locale,
    t: (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(dict, key, vars),
  };
}
