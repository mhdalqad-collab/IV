import ForecastingClient from "@/components/forecasting/ForecastingClient";

export const metadata = {
  title: "AI Forecasting | Selk.com",
  description:
    "Upload your warehouse data and get instant KPIs, benchmarks, and demand-match forecasts.",
};

export default function AIForecastingPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-heading">AI Forecasting</h1>
        <p className="text-muted text-[14px] mt-1 max-w-[720px]">
          Upload your warehouse data spreadsheet and we&apos;ll instantly calculate
          utilization, revenue potential, demand match, and benchmark gaps against
          the Oman &amp; GCC market.
        </p>
      </div>
      <ForecastingClient />
    </div>
  );
}
