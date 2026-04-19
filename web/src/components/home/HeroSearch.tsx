"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [slots, setSlots] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    const slotsNum = parseInt(slots, 10);
    if (slotsNum > 0) params.set("min_slots", String(slotsNum));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-0 bg-bk-amber rounded-[16px] p-1"
    >
      <div className="bg-white rounded-l-[12px] px-4 py-3">
        <div className="text-[11px] font-bold text-heading">Where</div>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City, postal code, or address"
          className="w-full text-[14px] text-body outline-none bg-transparent"
        />
      </div>
      <div className="bg-white border-l border-border px-4 py-3">
        <div className="text-[11px] font-bold text-heading">Dates</div>
        <input
          type="text"
          placeholder="Check-in — Check-out"
          className="w-full text-[14px] text-muted outline-none bg-transparent"
        />
      </div>
      <div className="bg-white border-l border-border px-4 py-3">
        <div className="text-[11px] font-bold text-heading">
          Storage type &middot; Size
        </div>
        <select className="w-full text-[14px] text-body outline-none bg-transparent">
          <option>Any type &middot; 120 m&sup2;</option>
          <option value="warehouse">Warehouse</option>
          <option value="container">Container</option>
          <option value="climate">Climate-controlled</option>
          <option value="basement">Basement</option>
          <option value="garage">Garage</option>
          <option value="outdoor">Outdoor</option>
        </select>
      </div>
      <div className="bg-white border-l border-border px-4 py-3">
        <div className="text-[11px] font-bold text-heading">Slots</div>
        <input
          type="number"
          min={1}
          value={slots}
          onChange={(e) => setSlots(e.target.value)}
          placeholder="e.g. 2"
          className="w-full text-[14px] text-body outline-none bg-transparent"
        />
      </div>
      <button
        type="submit"
        className="bg-bk-cta hover:bg-bk-cta-hover text-white font-bold px-8 rounded-r-[12px] text-[15px] transition-colors"
      >
        Search
      </button>
    </form>
  );
}
