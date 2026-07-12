"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VALID_TYPES, TYPE_LABELS } from "@/lib/constants";
import { useT } from "@/components/i18n/LocaleProvider";

export default function HeroSearch() {
  const router = useRouter();
  const t = useT();
  const [city, setCity] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [slots, setSlots] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (type) params.set("type", type);
    const sizeNum = parseInt(size, 10);
    if (sizeNum > 0) params.set("min_size", String(sizeNum));
    const slotsNum = parseInt(slots, 10);
    if (slotsNum > 0) params.set("min_slots", String(slotsNum));
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    router.push(`/search?${params.toString()}`);
  }

  const today = new Date().toISOString().split("T")[0];

  const cellBase = "bg-white px-4 py-3";
  const cellRounded = "rounded-[10px] lg:rounded-none";
  const cellDivider = "lg:border-s border-border";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1.4fr_1fr_0.8fr_0.7fr_auto] gap-1 lg:gap-0 bg-bk-amber rounded-[16px] p-1"
    >
      <div className={`${cellBase} ${cellRounded} lg:rounded-s-[12px]`}>
        <label className="block text-[11px] font-bold text-heading">{t("search.where")}</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("search.wherePlaceholder")}
          className="w-full text-[14px] text-body outline-none bg-transparent"
        />
      </div>

      <div className={`${cellBase} ${cellRounded} ${cellDivider} grid grid-cols-2 gap-2`}>
        <div>
          <label className="block text-[11px] font-bold text-heading">{t("search.checkIn")}</label>
          <input
            type="date"
            value={checkin}
            min={today}
            onChange={(e) => {
              const v = e.target.value;
              setCheckin(v);
              if (checkout && v && checkout <= v) setCheckout("");
            }}
            className="w-full text-[14px] text-body outline-none bg-transparent"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-heading">{t("search.checkOut")}</label>
          <input
            type="date"
            value={checkout}
            min={checkin || today}
            onChange={(e) => setCheckout(e.target.value)}
            className="w-full text-[14px] text-body outline-none bg-transparent"
          />
        </div>
      </div>

      <div className={`${cellBase} ${cellRounded} ${cellDivider}`}>
        <label className="block text-[11px] font-bold text-heading">{t("search.storageType")}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full text-[14px] text-body outline-none bg-transparent"
        >
          <option value="">{t("search.anyType")}</option>
          {VALID_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {TYPE_LABELS[tp]}
            </option>
          ))}
        </select>
      </div>

      <div className={`${cellBase} ${cellRounded} ${cellDivider}`}>
        <label className="block text-[11px] font-bold text-heading">
          {t("search.minSize")}
        </label>
        <input
          type="number"
          min={1}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder={t("search.minSizePlaceholder")}
          className="w-full text-[14px] text-body outline-none bg-transparent"
        />
      </div>

      <div className={`${cellBase} ${cellRounded} ${cellDivider}`}>
        <label className="block text-[11px] font-bold text-heading">{t("search.slots")}</label>
        <input
          type="number"
          min={1}
          value={slots}
          onChange={(e) => setSlots(e.target.value)}
          placeholder={t("search.slotsPlaceholder")}
          className="w-full text-[14px] text-body outline-none bg-transparent"
        />
      </div>

      <button
        type="submit"
        className="bg-bk-cta hover:bg-bk-cta-hover text-white font-bold px-8 py-3 lg:py-0 rounded-[10px] lg:rounded-e-[12px] lg:rounded-s-none text-[15px] transition-colors"
      >
        {t("search.submit")}
      </button>
    </form>
  );
}
