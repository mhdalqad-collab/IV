"use client";

import dynamic from "next/dynamic";
import { useT } from "@/components/i18n/LocaleProvider";
import type { PinValue } from "./LocationPickerMap";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-feature rounded-[8px] animate-pulse" />
  ),
});

export default function LocationPicker({
  value,
  cityCenter,
  onChange,
  onClear,
}: {
  value: PinValue | null;
  cityCenter: PinValue | null;
  onChange: (p: PinValue) => void;
  onClear: () => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="text-[11px] text-muted mb-2">
        {t("createListing.fields.locationHelp")}
      </p>
      <LocationPickerMap
        value={value}
        cityCenter={cityCenter}
        onChange={onChange}
      />
      <div className="flex items-center justify-between mt-1.5 min-h-[20px]">
        <span className="text-[11px] text-muted" dir="ltr">
          {value
            ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
            : t("createListing.fields.noPin")}
        </span>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-semibold text-bk-red hover:underline"
          >
            {t("createListing.fields.clearPin")}
          </button>
        )}
      </div>
    </div>
  );
}
