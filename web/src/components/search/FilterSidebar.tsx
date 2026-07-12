"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VALID_TYPES } from "@/lib/constants";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

export default function FilterSidebar() {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useT();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v) params.set(k, v as string);
    }
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          {t("filter.city")}
        </label>
        <input
          name="city"
          defaultValue={sp.get("city") || ""}
          placeholder={t("filter.cityPlaceholder")}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          {t("filter.type")}
        </label>
        <select
          name="type"
          defaultValue={sp.get("type") || ""}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        >
          <option value="">{t("filter.allTypes")}</option>
          {VALID_TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {t(`listingType.${tp}` as TranslationKey)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          {t("filter.maxPrice")}
        </label>
        <input
          name="max_price"
          type="number"
          defaultValue={sp.get("max_price") || ""}
          placeholder={t("filter.maxPricePlaceholder")}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">
            {t("filter.minSize")}
          </label>
          <input
            name="min_size"
            type="number"
            defaultValue={sp.get("min_size") || ""}
            className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">
            {t("filter.maxSize")}
          </label>
          <input
            name="max_size"
            type="number"
            defaultValue={sp.get("max_size") || ""}
            className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          {t("filter.minSlots")}
        </label>
        <input
          name="min_slots"
          type="number"
          min={1}
          defaultValue={sp.get("min_slots") || ""}
          placeholder={t("filter.minSlotsPlaceholder")}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          {t("filter.sortBy")}
        </label>
        <select
          name="sort"
          defaultValue={sp.get("sort") || ""}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        >
          <option value="newest">{t("filter.sortNewest")}</option>
          <option value="price_asc">{t("filter.sortPriceAsc")}</option>
          <option value="price_desc">{t("filter.sortPriceDesc")}</option>
          <option value="rating">{t("filter.sortRating")}</option>
          <option value="size_desc">{t("filter.sortSizeDesc")}</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-bk-cta text-white font-bold py-2.5 rounded-[8px] hover:bg-bk-cta-hover transition-colors"
      >
        {t("filter.apply")}
      </button>
    </form>
  );
}
