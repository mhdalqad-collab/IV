"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VALID_TYPES, TYPE_LABELS } from "@/lib/constants";

export default function CreateListingForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      city: fd.get("city"),
      country: fd.get("country") || "OM",
      type: fd.get("type"),
      size_sqm: Number(fd.get("size_sqm")),
      slots: Number(fd.get("slots")) || 1,
      price_sqm: Number(fd.get("price_sqm")),
      description: fd.get("description"),
      amenities: (fd.get("amenities") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      free_cancel: fd.get("free_cancel") === "on",
      insurance: fd.get("insurance") === "on",
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create listing");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-bk-cta text-white font-bold px-4 py-2.5 rounded-[8px] text-[13px] hover:bg-bk-cta-hover transition-colors"
      >
        {open ? "Cancel" : "+ Create listing"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-[16px] p-6 border border-border space-y-4">
          {error && (
            <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">Title</label>
              <input name="title" required className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">City</label>
              <input name="city" required className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">Country</label>
              <input name="country" defaultValue="OM" className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">Type</label>
              <select name="type" required className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta">
                {VALID_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">Size (m&sup2;)</label>
              <input name="size_sqm" type="number" required min={1} className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1">Slots</label>
              <input name="slots" type="number" required min={1} defaultValue={1} className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">Price per m&sup2;/month (&euro;)</label>
            <input name="price_sqm" type="number" required min={0.01} step={0.01} className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta resize-none" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-heading mb-1">Amenities (comma-separated)</label>
            <input name="amenities" placeholder="e.g. 24/7 access, CCTV, loading dock" className="w-full border border-border rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-bk-cta" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="free_cancel" /> Free cancellation
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="insurance" /> Insurance included
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-bk-cta text-white font-bold px-5 py-2.5 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating..." : "Create listing"}
          </button>
        </form>
      )}
    </div>
  );
}
