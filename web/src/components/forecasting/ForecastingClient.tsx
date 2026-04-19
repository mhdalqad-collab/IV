"use client";

import { useCallback, useRef, useState } from "react";

type Fields = {
  name?: string;
  location?: string;
  area?: number;
  vacancy?: number;
  occupancy?: number;
  storageType?: string;
  tempRange?: string;
  racking?: string;
  bays?: number;
  crane?: boolean;
  security?: string;
  fire?: string;
  gdp?: boolean;
  haccp?: boolean;
  years?: number;
  portKm?: number;
  cityKm?: number;
  rate?: number;
  lease?: string;
  minBooking?: number;
};

type Demand = {
  category: string;
  probability: number;
  renter: string;
  duration: string;
  revenueLow: number;
  revenueHigh: number;
};

const SAMPLE: Fields = {
  name: "Al-Muntazah Logistics Hub",
  location: "Muscat, Oman",
  area: 8500,
  vacancy: 38,
  occupancy: 62,
  storageType: "Mixed (Dry + Cold)",
  tempRange: "2-8°C",
  racking: "Selective",
  bays: 6,
  crane: true,
  security: "CCTV + Guarded",
  fire: "Sprinkler",
  gdp: true,
  haccp: false,
  years: 7,
  portKm: 22,
  cityKm: 12,
  rate: 2.1,
  lease: "Monthly",
  minBooking: 10,
};

function parseNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  const s = String(v);
  if (/\[.*\]/.test(s)) return undefined;
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

function parseYesNo(v: unknown): boolean | undefined {
  if (v == null) return undefined;
  const s = String(v).toLowerCase().trim();
  if (/\[.*\]/.test(s)) return undefined;
  if (s === "yes" || s === "y" || s === "true") return true;
  if (s === "no" || s === "n" || s === "false") return false;
  return undefined;
}

function parseString(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /^\[.*\]$/.test(s)) return undefined;
  return s;
}

const FIELD_MAP: Record<string, keyof Fields> = {
  "warehouse name / id": "name",
  "location / emirate / city": "location",
  "total gross area (sqm)": "area",
  "total available (empty) space %": "vacancy",
  "current occupancy rate (%)": "occupancy",
  "storage type": "storageType",
  "temperature range (if cold)": "tempRange",
  "racking system": "racking",
  "number of loading bays": "bays",
  "crane / heavy equipment?": "crane",
  "security system": "security",
  "fire suppression": "fire",
  "gdp / gmp certified?": "gdp",
  "haccp certified?": "haccp",
  "years of operation": "years",
  "distance to nearest port (km)": "portKm",
  "distance to city center (km)": "cityKm",
  "monthly asking rate (per pallet)": "rate",
  "preferred lease duration": "lease",
  "minimum booking size": "minBooking",
};

const NUMERIC: Array<keyof Fields> = [
  "area",
  "vacancy",
  "occupancy",
  "bays",
  "years",
  "portKm",
  "cityKm",
  "rate",
  "minBooking",
];

const YES_NO: Array<keyof Fields> = ["crane", "gdp", "haccp"];

function extractFields(rows: unknown[][]): Fields {
  const out: Fields = {};
  for (const row of rows) {
    if (!row || !row[0]) continue;
    const key = String(row[0]).toLowerCase().trim();
    const field = FIELD_MAP[key];
    if (!field) continue;
    const raw = row[1];
    if (NUMERIC.includes(field)) {
      const n = parseNumber(raw);
      if (n !== undefined) (out as Record<string, unknown>)[field] = n;
    } else if (YES_NO.includes(field)) {
      const b = parseYesNo(raw);
      if (b !== undefined) (out as Record<string, unknown>)[field] = b;
    } else {
      const s = parseString(raw);
      if (s !== undefined) (out as Record<string, unknown>)[field] = s;
    }
  }
  return out;
}

function computeDemand(f: Fields): Demand[] {
  const cold = /cold/i.test(f.storageType || "") || /-?\d+\s*[°]?c/i.test(f.tempRange || "");
  const isDryGeneral = /dry|general|mixed/i.test(f.storageType || "");
  const urban = typeof f.cityKm === "number" && f.cityKm <= 15;
  const nearPort = typeof f.portKm === "number" && f.portKm <= 30;

  return [
    {
      category: "Pharmaceutical / GDP Cold",
      probability: cold && f.gdp ? 95 : cold ? 55 : 15,
      renter: "Pharma importer / distributor",
      duration: "6–12 months",
      revenueLow: 800,
      revenueHigh: 2500,
    },
    {
      category: "Food & Beverage (Cold Chain)",
      probability: cold && f.haccp ? 85 : cold ? 70 : 20,
      renter: "FMCG importer, F&B distributor",
      duration: "1–3 months",
      revenueLow: 400,
      revenueHigh: 1200,
    },
    {
      category: "eCommerce Fulfillment",
      probability: urban ? 75 : 40,
      renter: "D2C brand, Amazon/Noon seller",
      duration: "Weekly – Monthly",
      revenueLow: 200,
      revenueHigh: 800,
    },
    {
      category: "Construction Materials",
      probability: f.crane ? 65 : 30,
      renter: "Developer / contractor",
      duration: "3–6 months",
      revenueLow: 300,
      revenueHigh: 600,
    },
    {
      category: "O&G Equipment",
      probability: f.crane && nearPort ? 55 : f.crane ? 35 : 15,
      renter: "Oilfield services company",
      duration: "6–24 months",
      revenueLow: 1000,
      revenueHigh: 5000,
    },
    {
      category: "SME / General Goods",
      probability: isDryGeneral ? 85 : 55,
      renter: "SME importer, retailer, trader",
      duration: "Monthly",
      revenueLow: 150,
      revenueHigh: 500,
    },
    {
      category: "Free Zone / Re-export",
      probability: nearPort ? 65 : 25,
      renter: "Re-exporter / international trader",
      duration: "3–12 months",
      revenueLow: 500,
      revenueHigh: 2000,
    },
  ];
}

function portScore(km?: number): number {
  if (typeof km !== "number") return 0;
  return Math.max(0, Math.min(10, Math.round(10 - km / 5)));
}

function readinessScore(f: Fields): number {
  let s = 0;
  if (f.security && /cctv|guard/i.test(f.security)) s += 15;
  if (f.fire && /sprinkler/i.test(f.fire)) s += 10;
  if (f.gdp) s += 15;
  if (f.haccp) s += 10;
  if (typeof f.years === "number" && f.years >= 2) s += 10;
  if (typeof f.portKm === "number" && f.portKm <= 30) s += 10;
  if (typeof f.cityKm === "number" && f.cityKm <= 15) s += 10;
  if (typeof f.occupancy === "number" && f.occupancy >= 60) s += 10;
  if (typeof f.bays === "number" && f.bays >= 4) s += 10;
  return Math.min(100, s);
}

function monthlyRevenue(f: Fields, ratio: number): number {
  if (!f.area || !f.rate) return 0;
  // Rough pallets estimate: 1 pallet per ~2 sqm
  const pallets = f.area / 2;
  return Math.round(pallets * f.rate * ratio);
}

export default function ForecastingClient() {
  const [fields, setFields] = useState<Fields | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    setFileName(file.name);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
      }) as unknown[][];
      const parsed = extractFields(rows);
      const filledCount = Object.values(parsed).filter(
        (v) => v !== undefined && v !== ""
      ).length;
      if (filledCount < 3) {
        setFields(SAMPLE);
        setUsingSample(true);
      } else {
        setFields(parsed);
        setUsingSample(false);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not parse file. Please upload a valid .xlsx"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function useSample() {
    setFields(SAMPLE);
    setFileName("sample-data.xlsx");
    setUsingSample(true);
  }

  function reset() {
    setFields(null);
    setFileName("");
    setError("");
    setUsingSample(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!fields) {
    return (
      <div className="grid grid-cols-[1fr_340px] gap-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`bg-white border-2 border-dashed rounded-[16px] p-10 text-center transition-colors ${
            dragOver ? "border-bk-cta bg-feature" : "border-border"
          }`}
        >
          <div className="mx-auto w-14 h-14 rounded-full bg-feature flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-7 h-7 text-bk-cta"
            >
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold text-heading mb-1">
            Upload your warehouse data
          </h2>
          <p className="text-[13px] text-muted mb-5 max-w-[420px] mx-auto">
            Drag &amp; drop an Excel file (.xlsx) or click below to browse. Use the
            Intellventory template on the right for best results.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFileChange}
            className="hidden"
            id="wh-file"
          />
          <label
            htmlFor="wh-file"
            className="inline-block bg-bk-cta text-white font-bold text-[14px] px-6 py-2.5 rounded-[8px] cursor-pointer hover:bg-bk-cta-hover transition-colors"
          >
            {loading ? "Processing..." : "Choose file"}
          </label>
          {fileName && !loading && (
            <div className="text-[12px] text-muted mt-3">{fileName}</div>
          )}
          {error && (
            <div className="text-[12px] text-bk-red mt-3 font-semibold">{error}</div>
          )}

          <div className="mt-8 pt-6 border-t border-border text-[12px] text-muted">
            Want a quick preview?{" "}
            <button
              onClick={useSample}
              className="text-bk-cta font-semibold hover:underline"
            >
              Load sample data
            </button>
          </div>
        </div>

        <aside className="bg-white border border-border rounded-[16px] p-5 h-fit">
          <h3 className="text-[14px] font-bold text-heading mb-2">Template</h3>
          <p className="text-[12px] text-muted mb-4">
            Download our Intellventory warehouse input template to ensure the AI
            reads every field correctly.
          </p>
          <a
            href="/assets/icons/Intellventory_Investor_Ch.xlsx"
            download
            className="block w-full bg-feature text-heading text-center font-semibold text-[13px] py-2.5 rounded-[8px] hover:bg-border transition-colors"
          >
            Download template (.xlsx)
          </a>
          <ul className="mt-5 space-y-2 text-[12px] text-muted">
            <li>• 1 sheet, 3 sections</li>
            <li>• Warehouse profile + auto KPIs</li>
            <li>• Demand match signals</li>
          </ul>
        </aside>
      </div>
    );
  }

  const demand = computeDemand(fields);
  const readiness = readinessScore(fields);
  const portProx = portScore(fields.portKm);
  const potential = monthlyRevenue(fields, (fields.occupancy ?? 0) / 100);
  const lost = monthlyRevenue(fields, (fields.vacancy ?? 0) / 100);

  // Benchmark comparison (Your vs Oman vs GCC)
  const OMAN_OCC = 62;
  const GCC_OCC = 72;

  const occ = fields.occupancy ?? 0;
  const vac = fields.vacancy ?? (100 - occ);

  return (
    <div className="space-y-6">
      {usingSample && (
        <div className="bg-bk-amber-soft border border-bk-amber/40 rounded-[12px] p-4 flex items-start gap-3">
          <div className="text-[20px] leading-none">⚠️</div>
          <div className="text-[13px]">
            <div className="font-bold text-heading">
              Showing sample analysis
            </div>
            <div className="text-muted">
              We couldn&apos;t detect filled-in values in your upload — the
              template&apos;s blue cells are still placeholders. Fill them in
              and upload again to see your own numbers.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-[16px] p-5 border border-border flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] text-muted uppercase font-bold tracking-wide">
            {fileName}
          </div>
          <h2 className="text-[22px] font-extrabold text-heading">
            {fields.name || "Unnamed warehouse"}
          </h2>
          <p className="text-[13px] text-muted">
            {fields.location || "Location unknown"} ·{" "}
            {fields.storageType || "—"} ·{" "}
            {fields.area ? `${fields.area.toLocaleString()} m²` : "— m²"}
          </p>
        </div>
        <button
          onClick={reset}
          className="text-[13px] font-semibold text-bk-cta hover:underline whitespace-nowrap"
        >
          Upload different file
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Occupancy",
            value: occ ? `${occ}%` : "—",
            hint: `Oman avg ${OMAN_OCC}%`,
            tone: occ >= 70 ? "green" : occ >= 50 ? "amber" : "red",
          },
          {
            label: "Vacancy",
            value: vac ? `${vac}%` : "—",
            hint: vac > 50 ? "🔴 urgent listing" : vac > 30 ? "⚠️ list on platform" : "✅ healthy",
            tone: vac > 50 ? "red" : vac > 30 ? "amber" : "green",
          },
          {
            label: "Readiness score",
            value: `${readiness}/100`,
            hint:
              readiness >= 80
                ? "Top placement"
                : readiness >= 60
                  ? "Visible in search"
                  : "Low visibility",
            tone: readiness >= 80 ? "green" : readiness >= 60 ? "amber" : "red",
          },
          {
            label: "Port proximity",
            value: `${portProx}/10`,
            hint:
              typeof fields.portKm === "number"
                ? `${fields.portKm} km to port`
                : "Distance unknown",
            tone: portProx >= 7 ? "green" : portProx >= 4 ? "amber" : "red",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white border border-border rounded-[16px] p-4"
          >
            <div className="text-[11px] font-bold text-muted uppercase tracking-wide">
              {k.label}
            </div>
            <div
              className={`text-[28px] font-extrabold ${
                k.tone === "green"
                  ? "text-bk-green"
                  : k.tone === "red"
                    ? "text-bk-red"
                    : k.tone === "amber"
                      ? "text-bk-amber"
                      : "text-heading"
              }`}
            >
              {k.value}
            </div>
            <div className="text-[11px] text-muted">{k.hint}</div>
          </div>
        ))}
      </div>

      {/* Revenue + Chart row */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Revenue card */}
        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-3">
            Revenue outlook (monthly)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-feature rounded-[12px] p-4">
              <div className="text-[11px] font-bold text-muted uppercase">
                Earning now
              </div>
              <div className="text-[24px] font-extrabold text-bk-green">
                ${potential.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted">
                @ {occ}% occupancy × {fields.rate ?? 0} / pallet
              </div>
            </div>
            <div className="bg-bk-red-soft rounded-[12px] p-4">
              <div className="text-[11px] font-bold text-muted uppercase">
                Lost to vacancy
              </div>
              <div className="text-[24px] font-extrabold text-bk-red">
                ${lost.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted">
                Unlock by listing on Selk
              </div>
            </div>
          </div>
          <div className="mt-4 text-[12px] text-muted">
            Based on {fields.area ? `${fields.area.toLocaleString()} m²` : "area"}{" "}
            ≈ {fields.area ? Math.round(fields.area / 2).toLocaleString() : "—"}{" "}
            pallet capacity.
          </div>
        </div>

        {/* Benchmark bar chart */}
        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-4">
            Occupancy benchmark
          </h3>
          <BarChart
            rows={[
              { label: "Your WH", value: occ, color: "#194f82" },
              { label: "Oman avg", value: OMAN_OCC, color: "#8aa6c1" },
              { label: "GCC avg", value: GCC_OCC, color: "#c2d4e3" },
            ]}
          />
        </div>
      </div>

      {/* Space donut + Profile grid */}
      <div className="grid grid-cols-[320px_1fr] gap-4">
        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-3">
            Space utilization
          </h3>
          <Donut occupied={occ} vacant={vac} />
        </div>

        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-3">
            Profile details
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <ProfileRow label="Years of operation" value={fields.years} />
            <ProfileRow label="Loading bays" value={fields.bays} />
            <ProfileRow label="Racking" value={fields.racking} />
            <ProfileRow label="Temperature" value={fields.tempRange} />
            <ProfileRow label="Security" value={fields.security} />
            <ProfileRow label="Fire suppression" value={fields.fire} />
            <ProfileRow
              label="GDP / GMP"
              value={fields.gdp === undefined ? undefined : fields.gdp ? "Certified" : "Not certified"}
            />
            <ProfileRow
              label="HACCP"
              value={fields.haccp === undefined ? undefined : fields.haccp ? "Certified" : "Not certified"}
            />
            <ProfileRow
              label="Crane / heavy"
              value={fields.crane === undefined ? undefined : fields.crane ? "Yes" : "No"}
            />
            <ProfileRow label="Lease preference" value={fields.lease} />
            <ProfileRow label="Min booking" value={fields.minBooking ? `${fields.minBooking} pallets` : undefined} />
            <ProfileRow label="Asking rate" value={fields.rate ? `${fields.rate} / pallet / month` : undefined} />
          </div>
        </div>
      </div>

      {/* Price position + Seasonal demand */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-1">
            Price position vs. market
          </h3>
          <p className="text-[12px] text-muted mb-4">
            Your asking rate benchmarked against Oman &amp; GCC averages.
          </p>
          <BarChart
            rows={[
              { label: "Your WH", value: fields.rate ?? 0, color: "#194f82" },
              { label: "Oman avg", value: 2.1, color: "#8aa6c1" },
              { label: "GCC avg", value: 3.4, color: "#c2d4e3" },
            ]}
            suffix=" / pallet / mo"
            decimals={2}
          />
          <div className="mt-4 text-[12px] text-muted">
            {fields.rate
              ? fields.rate < 1.8
                ? "You're under-priced vs. market — platform will auto-suggest uplift."
                : fields.rate > 2.5
                  ? "Above market — consider dynamic pricing to stay competitive."
                  : "Competitively priced within ±15% of the Oman benchmark."
              : "Upload a rate to see position."}
          </div>
        </div>

        <div className="bg-white border border-border rounded-[16px] p-5">
          <h3 className="text-[14px] font-bold text-heading mb-1">
            Seasonal demand forecast
          </h3>
          <p className="text-[12px] text-muted mb-4">
            Expected booking uplift by month for your storage profile.
          </p>
          <SeasonChart data={seasonalForecast(fields)} />
        </div>
      </div>

      {/* Certifications & compliance status */}
      <div className="bg-white border border-border rounded-[16px] p-5">
        <h3 className="text-[14px] font-bold text-heading mb-3">
          Certifications &amp; compliance
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "GDP / GMP",
              ok: fields.gdp === true,
              known: fields.gdp !== undefined,
              hint: "Unlocks pharma demand (+35% premium)",
            },
            {
              label: "HACCP",
              ok: fields.haccp === true,
              known: fields.haccp !== undefined,
              hint: "Required for F&B cold chain",
            },
            {
              label: "CCTV / Security",
              ok: !!(fields.security && /cctv|guard/i.test(fields.security)),
              known: !!fields.security,
              hint: "Required for platform listing",
            },
            {
              label: "Fire suppression",
              ok: !!(fields.fire && /sprinkler/i.test(fields.fire)),
              known: !!fields.fire,
              hint: "Sprinkler minimum for insurance",
            },
          ].map((c) => (
            <div
              key={c.label}
              className={`rounded-[12px] p-4 border ${
                c.ok
                  ? "bg-bk-green-soft border-bk-green/30"
                  : c.known
                    ? "bg-bk-red-soft border-bk-red/30"
                    : "bg-feature border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[16px] ${
                    c.ok
                      ? "text-bk-green"
                      : c.known
                        ? "text-bk-red"
                        : "text-muted"
                  }`}
                >
                  {c.ok ? "✓" : c.known ? "✕" : "?"}
                </span>
                <span className="text-[13px] font-bold text-heading">
                  {c.label}
                </span>
              </div>
              <div className="text-[11px] text-muted">{c.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 extra KPIs */}
      <div className="bg-white border border-border rounded-[16px] p-5">
        <h3 className="text-[14px] font-bold text-heading mb-3">
          Platform intelligence scores
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {section2Scores(fields).map((s) => (
            <div key={s.label} className="border border-border rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] font-bold text-muted uppercase">
                  {s.label}
                </div>
                <div
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    s.score >= 70
                      ? "bg-bk-green-soft text-bk-green"
                      : s.score >= 40
                        ? "bg-bk-amber-soft text-bk-amber"
                        : "bg-bk-red-soft text-bk-red"
                  }`}
                >
                  {s.score}/100
                </div>
              </div>
              <div className="h-2 bg-feature rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${
                    s.score >= 70
                      ? "bg-bk-green"
                      : s.score >= 40
                        ? "bg-bk-amber"
                        : "bg-bk-red"
                  }`}
                  style={{ width: `${s.score}%` }}
                />
              </div>
              <div className="text-[12px] text-muted">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Match Panel */}
      <div className="bg-white border border-border rounded-[16px] p-5">
        <h3 className="text-[14px] font-bold text-heading mb-1">
          Demand match forecast
        </h3>
        <p className="text-[12px] text-muted mb-4">
          Probability of match based on your profile vs. current demand pool.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-bold text-muted uppercase border-b border-border">
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 w-[220px]">Match</th>
                <th className="py-2 pr-3">Likely renter</th>
                <th className="py-2 pr-3">Duration</th>
                <th className="py-2">Revenue (USD / mo)</th>
              </tr>
            </thead>
            <tbody>
              {demand
                .slice()
                .sort((a, b) => b.probability - a.probability)
                .map((d) => (
                  <tr key={d.category} className="border-b border-border">
                    <td className="py-3 pr-3 font-semibold text-heading">
                      {d.category}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-feature rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.probability >= 70
                                ? "bg-bk-green"
                                : d.probability >= 40
                                  ? "bg-bk-amber"
                                  : "bg-bk-red"
                            }`}
                            style={{ width: `${d.probability}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-bold text-heading w-10 text-right">
                          {d.probability}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-muted">{d.renter}</td>
                    <td className="py-3 pr-3 text-muted">{d.duration}</td>
                    <td className="py-3 text-heading font-semibold">
                      ${d.revenueLow}–${d.revenueHigh}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <>
      <div className="text-muted">{label}</div>
      <div className="font-semibold text-heading">
        {value === undefined || value === "" ? "—" : value}
      </div>
    </>
  );
}

function BarChart({
  rows,
  suffix = "%",
  decimals = 0,
}: {
  rows: { label: string; value: number; color: string }[];
  suffix?: string;
  decimals?: number;
}) {
  const max = Math.max(
    suffix === "%" ? 100 : 0.0001,
    ...rows.map((r) => r.value)
  );
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-[12px] mb-1">
            <span className="text-muted">{r.label}</span>
            <span className="font-bold text-heading">
              {r.value.toFixed(decimals)}
              {suffix}
            </span>
          </div>
          <div className="h-3 bg-feature rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${max > 0 ? (r.value / max) * 100 : 0}%`,
                backgroundColor: r.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SeasonChart({ data }: { data: { month: string; uplift: number }[] }) {
  const max = Math.max(5, ...data.map((d) => d.uplift));
  return (
    <div>
      <div className="flex items-end gap-1 h-[140px]">
        {data.map((d) => {
          const h = Math.max(4, (d.uplift / max) * 130);
          const pos = d.uplift >= 0;
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t-[4px] transition-all"
                style={{
                  height: `${h}px`,
                  backgroundColor: pos
                    ? d.uplift >= 20
                      ? "#10B981"
                      : "#194f82"
                    : "#EF4444",
                }}
                title={`${d.month}: +${d.uplift}%`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d) => (
          <div
            key={d.month}
            className="flex-1 text-center text-[10px] text-muted font-semibold"
          >
            {d.month}
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {data.map((d) => (
          <div
            key={d.month}
            className="flex-1 text-center text-[10px] text-heading font-bold"
          >
            +{d.uplift}%
          </div>
        ))}
      </div>
    </div>
  );
}

function seasonalForecast(
  f: Fields
): { month: string; uplift: number }[] {
  const cold = /cold/i.test(f.storageType || "") || /-?\d+\s*[°]?c/i.test(f.tempRange || "");
  const urban = typeof f.cityKm === "number" && f.cityKm <= 15;
  // Baseline uplift pattern; amplified by profile fit
  const baseline = [
    { month: "Jan", uplift: 8 },
    { month: "Feb", uplift: 18 },
    { month: "Mar", uplift: 28 }, // Ramadan
    { month: "Apr", uplift: 12 },
    { month: "May", uplift: 6 },
    { month: "Jun", uplift: 10 },
    { month: "Jul", uplift: 14 }, // back-to-school
    { month: "Aug", uplift: 9 },
    { month: "Sep", uplift: 11 },
    { month: "Oct", uplift: 16 },
    { month: "Nov", uplift: 20 },
    { month: "Dec", uplift: 22 },
  ];
  return baseline.map((m) => {
    let v = m.uplift;
    if (cold && (m.month === "Feb" || m.month === "Mar")) v += 10;
    if (urban && (m.month === "Jul" || m.month === "Nov" || m.month === "Dec"))
      v += 6;
    return { month: m.month, uplift: Math.round(v) };
  });
}

function section2Scores(f: Fields): {
  label: string;
  score: number;
  hint: string;
}[] {
  const cold = /cold/i.test(f.storageType || "");
  const premiumScore = cold
    ? f.gdp
      ? 85
      : 60
    : 25;
  const portSc = portScore(f.portKm) * 10;
  const demandMatch = Math.min(
    100,
    Math.round(
      (f.gdp ? 25 : 0) +
        (f.haccp ? 15 : 0) +
        (cold ? 15 : 0) +
        (typeof f.cityKm === "number" && f.cityKm <= 15 ? 15 : 0) +
        (typeof f.portKm === "number" && f.portKm <= 30 ? 15 : 0) +
        (typeof f.bays === "number" && f.bays >= 4 ? 10 : 0) +
        (f.crane ? 5 : 0)
    )
  );
  const networkDensity =
    /muscat/i.test(f.location || "") ? 35 : /salalah|sohar|duqm/i.test(f.location || "") ? 50 : 60;
  const priceUtilization = f.rate
    ? f.rate < 1.8
      ? 55
      : f.rate > 2.5
        ? 65
        : 85
    : 40;
  return [
    {
      label: "Demand match",
      score: demandMatch,
      hint: ">70 = high booking probability",
    },
    {
      label: "Cold premium captured",
      score: premiumScore,
      hint: "+35–45% vs. dry storage expected",
    },
    {
      label: "Port proximity",
      score: portSc,
      hint: "Drives search ranking",
    },
    {
      label: "Price utilization",
      score: priceUtilization,
      hint: "Within ±15% of market",
    },
    {
      label: "Network density",
      score: networkDensity,
      hint: "Lower = first-mover advantage",
    },
    {
      label: "Platform readiness",
      score: readinessScore(f),
      hint: ">80 unlocks top placement",
    },
  ];
}

function Donut({ occupied, vacant }: { occupied: number; vacant: number }) {
  const total = Math.max(1, occupied + vacant);
  const occPct = (occupied / total) * 100;
  const r = 54;
  const c = 2 * Math.PI * r;
  const occLen = (occPct / 100) * c;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="w-[140px] h-[140px]">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#e6ebf1"
          strokeWidth="18"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#194f82"
          strokeWidth="18"
          strokeDasharray={`${occLen} ${c - occLen}`}
          strokeDashoffset={c / 4}
          transform="rotate(-90 70 70)"
          strokeLinecap="round"
        />
        <text
          x="70"
          y="72"
          textAnchor="middle"
          className="font-extrabold"
          style={{ fontSize: "22px", fill: "#0b2540" }}
        >
          {Math.round(occPct)}%
        </text>
        <text
          x="70"
          y="90"
          textAnchor="middle"
          style={{ fontSize: "10px", fill: "#6b7a8a" }}
        >
          occupied
        </text>
      </svg>
      <div className="text-[12px] space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-bk-blue" />
          <span className="text-heading font-semibold">Occupied</span>
          <span className="text-muted">{occupied}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-feature border border-border" />
          <span className="text-heading font-semibold">Vacant</span>
          <span className="text-muted">{vacant}%</span>
        </div>
      </div>
    </div>
  );
}
