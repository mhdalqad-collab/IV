"use client";

import Link from "next/link";
import HeaderAuth from "./HeaderAuth";
import CurrencySelector from "@/components/currency/CurrencySelector";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

export default function Header() {
  const t = useT();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <header className="bg-bk-blue text-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2"
            dir={isAr ? "rtl" : "ltr"}
          >
            <span className="text-[22px] font-extrabold tracking-tight leading-none">
              {isAr ? (
                <span className="text-white">{t("brand.name")}</span>
              ) : (
                <>
                  <span className="text-white">selk</span>
                  <span className="text-bk-amber">.om</span>
                </>
              )}
            </span>
            <sup className="text-[10px] font-bold text-bk-amber">B2B</sup>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 text-[13px]">
            <LanguageSelector />
            <CurrencySelector />
            <Link
              href="/dashboard"
              className="hidden sm:inline-block opacity-90 hover:opacity-100"
            >
              {t("header.listYourSpace")}
            </Link>
            <HeaderAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
