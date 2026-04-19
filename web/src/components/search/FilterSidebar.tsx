"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VALID_TYPES, TYPE_LABELS } from "@/lib/constants";

export default function FilterSidebar() {
  const router = useRouter();
  const sp = useSearchParams();

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
        <label className="block text-[13px] font-semibold text-heading mb-1">City</label>
        <input
          name="city"
          defaultValue={sp.get("city") || ""}
          placeholder="e.g. Muscat"
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">Type</label>
        <select
          name="type"
          defaultValue={sp.get("type") || ""}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        >
          <option value="">All types</option>
          {VALID_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">Max price (per m&sup2;/month)</label>
        <input
          name="max_price"
          type="number"
          defaultValue={sp.get("max_price") || ""}
          placeholder="e.g. 50"
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">Min size (m&sup2;)</label>
          <input
            name="min_size"
            type="number"
            defaultValue={sp.get("min_size") || ""}
            className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">Max size (m&sup2;)</label>
          <input
            name="max_size"
            type="number"
            defaultValue={sp.get("max_size") || ""}
            className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">Min slots</label>
        <input
          name="min_slots"
          type="number"
          min={1}
          defaultValue={sp.get("min_slots") || ""}
          placeholder="e.g. 2"
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">Sort by</label>
        <select
          name="sort"
          defaultValue={sp.get("sort") || ""}
          className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Best rated</option>
          <option value="size_desc">Largest first</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-bk-cta text-white font-bold py-2.5 rounded-[8px] hover:bg-bk-cta-hover transition-colors"
      >
        Apply filters
      </button>
    </form>
  );
}
