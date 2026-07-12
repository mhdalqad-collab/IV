"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

type Column = {
  titleKey: TranslationKey;
  links: { labelKey: TranslationKey; href: string }[];
};

const columns: Column[] = [
  {
    titleKey: "footer.discover.title",
    links: [
      { labelKey: "footer.discover.links.pro", href: "#" },
      { labelKey: "footer.discover.links.offers", href: "#" },
      { labelKey: "footer.discover.links.index", href: "#" },
      { labelKey: "footer.discover.links.enterprise", href: "#" },
      { labelKey: "footer.discover.links.directory", href: "#" },
      { labelKey: "footer.discover.links.editorial", href: "#" },
    ],
  },
  {
    titleKey: "footer.terms.title",
    links: [
      { labelKey: "footer.terms.links.privacy", href: "#" },
      { labelKey: "footer.terms.links.tos", href: "#" },
      { labelKey: "footer.terms.links.cookies", href: "#" },
      { labelKey: "footer.terms.links.accessibility", href: "#" },
    ],
  },
  {
    titleKey: "footer.partners.title",
    links: [
      { labelKey: "footer.partners.links.extranet", href: "/dashboard" },
      { labelKey: "footer.partners.links.list", href: "/dashboard" },
      { labelKey: "footer.partners.links.help", href: "#" },
      { labelKey: "footer.partners.links.affiliate", href: "#" },
    ],
  },
  {
    titleKey: "footer.about.title",
    links: [
      { labelKey: "footer.about.links.help", href: "/support" },
      { labelKey: "footer.about.links.about", href: "#" },
      { labelKey: "footer.about.links.how", href: "#" },
      { labelKey: "footer.about.links.sustainability", href: "#" },
      { labelKey: "footer.about.links.careers", href: "#" },
      { labelKey: "footer.about.links.press", href: "#" },
    ],
  },
];

export default function Footer() {
  const t = useT();
  return (
    <footer className="bg-bk-blue text-white/80 text-[13px] pt-12 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {columns.map((col) => (
            <div key={col.titleKey}>
              <h5 className="text-white font-bold text-[14px] mb-3">
                {t(col.titleKey)}
              </h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-8">
          <div>
            <div className="text-[20px] font-extrabold text-white mb-2">
              {t("brand.domain")}
            </div>
            <p className="max-w-md">{t("footer.blurb")}</p>
            <p className="mt-1.5 text-white/50">{t("footer.copyright")}</p>
          </div>
          <div className="flex gap-6 text-[11px] font-bold text-white/40 tracking-wider" dir="ltr">
            <span>SELK.OM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
