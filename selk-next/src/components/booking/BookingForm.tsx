"use client";

import { useState } from "react";
import type { Listing } from "@/types";

const ERROR_MAP: Record<string, string> = {
  listing_not_found: "This listing is no longer available.",
  cannot_book_own: "You cannot book your own listing.",
  invalid_dates: "Please select valid start and end dates.",
  invalid_size: "Please enter a valid floor area.",
  default: "Something went wrong. Please try again.",
};

export default function BookingForm({ listing }: { listing: Listing }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [size, setSize] = useState(String(Math.min(Number(listing.size_sqm), 100)));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<number | null>(null);

  const priceSqm = Number(listing.price_sqm);
  const sizeNum = Number(size) || 0;

  let months = 0;
  let total = 0;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e > s) {
      const days = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
      months = Math.max(1, Math.ceil(days / 30));
      total = priceSqm * sizeNum * months;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          start_date: startDate,
          end_date: endDate,
          size_sqm: sizeNum,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERROR_MAP[data.error] || ERROR_MAP.default);
        setLoading(false);
        return;
      }
      setSuccess(data.booking.id);
    } catch {
      setError(ERROR_MAP.default);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-[48px] mb-4">&#10003;</div>
        <h2 className="text-[22px] font-bold text-heading mb-2">Booking confirmed!</h2>
        <p className="text-muted">Your booking ID is #{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">
          Floor area needed (m&sup2;)
        </label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          min={1}
          max={Number(listing.size_sqm)}
          required
          className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-heading mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta resize-none"
        />
      </div>

      {total > 0 && (
        <div className="bg-feature rounded-[8px] p-4 text-[14px]">
          <span className="font-bold text-heading">Estimated total: &euro;{total.toLocaleString()}</span>
          <span className="text-muted ml-2">
            ({months} month{months !== 1 ? "s" : ""} &times; {sizeNum} m&sup2;)
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
      >
        {loading ? "Processing..." : "Confirm booking"}
      </button>
    </form>
  );
}
