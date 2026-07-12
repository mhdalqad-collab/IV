import MapShell from "@/components/route-optimization/MapShell";
import { getMapListings } from "@/lib/mapListings";
import { getServerT } from "@/lib/i18n/server";

export const metadata = {
  title: "Route Optimization | Selk.om",
  description:
    "Interactive map of Oman showing live storage listings. Point-to-point routing coming soon.",
};

export default async function RouteOptimizationPage() {
  const { t } = await getServerT();
  const listings = await getMapListings();
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-heading">{t("routeOptPage.title")}</h1>
        <p className="text-muted text-[14px] mt-1 max-w-[720px]">{t("routeOptPage.subtitle")}</p>
      </div>
      <MapShell listings={listings} />
    </div>
  );
}
