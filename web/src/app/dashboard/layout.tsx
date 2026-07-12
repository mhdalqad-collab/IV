import { getServerT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getServerT();

  const navSections: Array<{
    titleKey: TranslationKey;
    items: { labelKey: TranslationKey; href: string; active?: boolean }[];
  }> = [
    {
      titleKey: "dashboardLayout.sections.property",
      items: [
        { labelKey: "dashboardLayout.items.overview", href: "/dashboard", active: true },
        { labelKey: "dashboardLayout.items.listings", href: "/dashboard" },
        { labelKey: "dashboardLayout.items.reservations", href: "/dashboard" },
      ],
    },
    {
      titleKey: "dashboardLayout.sections.finance",
      items: [
        { labelKey: "dashboardLayout.items.earnings", href: "/dashboard" },
        { labelKey: "dashboardLayout.items.payouts", href: "#" },
      ],
    },
    {
      titleKey: "dashboardLayout.sections.account",
      items: [
        { labelKey: "dashboardLayout.items.companyProfile", href: "#" },
        { labelKey: "dashboardLayout.items.settings", href: "#" },
      ],
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-8">
        <aside className="space-y-6">
          <h2 className="text-[18px] font-bold text-heading">{t("dashboardLayout.title")}</h2>
          {navSections.map((sec) => (
            <div key={sec.titleKey}>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                {t(sec.titleKey)}
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((item) => (
                  <li key={item.labelKey}>
                    <a
                      href={item.href}
                      className={`block px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                        item.active
                          ? "bg-bk-cta-soft text-bk-cta font-semibold"
                          : "text-body hover:bg-feature"
                      }`}
                    >
                      {t(item.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
