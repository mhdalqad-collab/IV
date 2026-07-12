"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

const features: Array<{
  key: TranslationKey;
  src: string;
  href: string | null;
}> = [
  { key: "nav.marketplace", src: "/assets/icons/marketplace.svg", href: "/search?type=warehouse" },
  { key: "nav.dashboards", src: "/assets/icons/dashboards.svg", href: "/ai-forecasting" },
  { key: "nav.routeOptimization", src: "/assets/icons/route-optimization.svg", href: null },
  { key: "nav.iotMonitoring", src: "/assets/icons/iot-monitoring.svg", href: null },
  { key: "nav.aiForecasting", src: "/assets/icons/ai-forecasting.svg", href: null },
  { key: "nav.costVsTrade", src: "/assets/icons/cost-vs-trade.svg", href: null },
];

const baseClasses =
  "relative flex flex-col items-center gap-1.5 px-5 py-3 text-[13px] font-medium border-b-2 border-transparent transition-all whitespace-nowrap";
const activeClasses = "text-white/70 hover:text-white hover:border-white/80";
const disabledClasses = "text-white/40 cursor-not-allowed";

function SoonBadge({ label }: { label: string }) {
  return (
    <span className="absolute top-0.5 end-0.5 text-[8px] font-extrabold uppercase tracking-wider bg-bk-amber text-bk-blue px-1.5 py-0.5 rounded-full leading-none">
      {label}
    </span>
  );
}

export default function CategoryNav() {
  const t = useT();
  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto pb-6"
      aria-label={t("nav.categories")}
    >
      {features.map((f) => {
        const label = t(f.key);
        const content = (
          <>
            <img
              src={f.src}
              alt={label}
              className="w-14 h-14"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            {label}
            {!f.href && <SoonBadge label={t("nav.soon")} />}
          </>
        );
        return f.href ? (
          <Link
            key={f.key}
            href={f.href}
            className={`${baseClasses} ${activeClasses}`}
          >
            {content}
          </Link>
        ) : (
          <span
            key={f.key}
            className={`${baseClasses} ${disabledClasses}`}
            aria-disabled="true"
          >
            {content}
          </span>
        );
      })}
    </nav>
  );
}
