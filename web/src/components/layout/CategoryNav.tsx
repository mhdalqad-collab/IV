import Link from "next/link";

const features = [
  { label: "Marketplace", src: "/assets/icons/marketplace.svg", href: null },
  { label: "Dashboards", src: "/assets/icons/dashboards.svg", href: null },
  { label: "Route Optimization", src: "/assets/icons/route-optimization.svg", href: null },
  { label: "IoT Monitoring", src: "/assets/icons/iot-monitoring.svg", href: null },
  { label: "AI Forecasting", src: "/assets/icons/ai-forecasting.svg", href: "/ai-forecasting" },
  { label: "Cost vs Trade", src: "/assets/icons/cost-vs-trade.svg", href: null },
];

export default function CategoryNav() {
  return (
    <div className="border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6">
        <nav className="flex items-center gap-1 overflow-x-auto py-1" aria-label="Categories">
          <Link
            href="/search?type=warehouse"
            className="flex flex-col items-center gap-1 px-4 py-2.5 text-[12px] font-medium text-white/70 hover:text-white border-b-2 border-transparent hover:border-white/80 transition-all whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-5 h-5"
            >
              <path d="M3 10v10h18V10" />
              <path d="M2 10l10-7 10 7" />
              <path d="M9 20v-6h6v6" />
            </svg>
            Warehouses
          </Link>

          <span className="mx-2 h-8 w-px bg-white/20" aria-hidden="true" />

          {features.map((f) => {
            const content = (
              <>
                <img
                  src={f.src}
                  alt={f.label}
                  className="w-5 h-5"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                {f.label}
              </>
            );
            return f.href ? (
              <Link
                key={f.label}
                href={f.href}
                className="flex flex-col items-center gap-1 px-4 py-2.5 text-[12px] font-medium text-white/70 hover:text-white border-b-2 border-transparent hover:border-white/80 transition-all whitespace-nowrap"
              >
                {content}
              </Link>
            ) : (
              <span
                key={f.label}
                className="flex flex-col items-center gap-1 px-4 py-2.5 text-[12px] font-medium text-white/70 whitespace-nowrap"
              >
                {content}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
