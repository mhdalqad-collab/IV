import ForecastingClient from "@/components/forecasting/ForecastingClient";
import { getServerT } from "@/lib/i18n/server";

export const metadata = {
  title: "AI Forecasting | Selk.om",
  description:
    "Upload your warehouse data and get instant KPIs, benchmarks, and demand-match forecasts.",
};

export default async function AIForecastingPage() {
  const { t } = await getServerT();
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-heading">{t("aiForecastingPage.title")}</h1>
        <p className="text-muted text-[14px] mt-1 max-w-[720px]">{t("aiForecastingPage.subtitle")}</p>
      </div>
      <ForecastingClient />
    </div>
  );
}
