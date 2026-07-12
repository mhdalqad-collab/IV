import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n";

export const metadata = {
  title: "Help & Support | Selk.om",
  description:
    "Get help with your Selk.om bookings, listings, and account. Contact our support team by email.",
};

const SUPPORT_EMAIL = "info@selk.om";

const topicKeys = ["bookings", "listings", "account", "trust"] as const;

export default async function SupportPage() {
  const { t } = await getServerT();
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-heading">{t("support.title")}</h1>
        <p className="text-muted text-[14px] mt-1 max-w-[720px]">{t("support.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topicKeys.map((k) => {
            const subject = t(`support.topics.${k}.subject` as TranslationKey);
            return (
              <a
                key={k}
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`}
                className="block bg-feature border border-border rounded-md p-5 hover:border-bk-cta transition-colors"
              >
                <div className="text-heading font-bold text-[16px] mb-1.5">
                  {t(`support.topics.${k}.title` as TranslationKey)}
                </div>
                <div className="text-muted text-[13px] leading-relaxed">
                  {t(`support.topics.${k}.description` as TranslationKey)}
                </div>
                <div className="text-bk-cta text-[13px] font-semibold mt-3">
                  {t("support.emailUs")}
                </div>
              </a>
            );
          })}
        </div>

        <aside className="bg-bk-blue text-white rounded-md p-6 h-fit">
          <div className="text-[14px] font-bold uppercase tracking-wider text-bk-amber mb-3">
            {t("support.contact")}
          </div>
          <div className="text-[13px] text-white/70 mb-1">{t("support.supportEmail")}</div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-white text-[18px] font-bold hover:text-bk-amber transition-colors break-all"
          >
            {SUPPORT_EMAIL}
          </a>

          <div className="border-t border-white/10 my-5" />

          <div className="text-[13px] text-white/70 mb-1">{t("support.responseTime")}</div>
          <div className="text-white text-[14px] font-semibold mb-4">{t("support.responseValue")}</div>

          <div className="text-[13px] text-white/70 mb-1">{t("support.hours")}</div>
          <div className="text-white text-[14px] font-semibold mb-4">{t("support.hoursValue")}</div>

          <div className="text-[13px] text-white/70 mb-1">{t("support.office")}</div>
          <div className="text-white text-[14px] font-semibold">{t("support.officeValue")}</div>
        </aside>
      </div>

      <div className="mt-10 bg-feature border border-border rounded-md p-6">
        <h2 className="text-heading font-bold text-[18px] mb-2">{t("support.beforeYouEmail")}</h2>
        <p className="text-muted text-[13px] mb-4 max-w-[720px]">{t("support.beforeBody")}</p>
        <ul className="text-body text-[13px] space-y-1.5 list-disc ps-5">
          <li>{t("support.bullets.email")}</li>
          <li>{t("support.bullets.ref")}</li>
          <li>{t("support.bullets.desc")}</li>
          <li>{t("support.bullets.screens")}</li>
        </ul>
        <div className="mt-5">
          <Link
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-block bg-bk-cta hover:bg-bk-cta-hover active:bg-bk-cta-active text-white font-bold text-[14px] px-5 py-2.5 rounded-sm transition-colors"
          >
            {t("support.emailButton", { email: SUPPORT_EMAIL })}
          </Link>
        </div>
      </div>
    </div>
  );
}
