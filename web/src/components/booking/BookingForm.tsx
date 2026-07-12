"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@/types";
import Price from "@/components/currency/Price";
import { useT } from "@/components/i18n/LocaleProvider";
import { bookingTotal } from "@/lib/bookingMath";

export default function BookingForm({ listing }: { listing: Listing }) {
  const t = useT();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [size, setSize] = useState(String(Math.min(Number(listing.size_sqm), 100)));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<number | null>(null);

  function errorFor(data: { error?: string; available?: number; max?: number }) {
    switch (data.error) {
      case "listing_not_found":
        return t("bookingPage.errors.listingNotFound");
      case "cannot_book_own":
        return t("bookingPage.errors.cannotBookOwn");
      case "invalid_dates":
        return t("bookingPage.errors.invalidDates");
      case "invalid_size":
        return t("bookingPage.errors.invalidSize");
      case "size_exceeds_listing":
        return t("bookingPage.errors.sizeExceeds", {
          max: data.max ?? Number(listing.size_sqm),
        });
      case "insufficient_capacity":
        return t("bookingPage.errors.insufficientCapacity", {
          available: data.available ?? 0,
        });
      default:
        return t("common.somethingWrong");
    }
  }

  const priceSqm = Number(listing.price_sqm);
  const sizeNum = Number(size) || 0;

  const priced =
    startDate && endDate
      ? bookingTotal(priceSqm, sizeNum, startDate, endDate)
      : null;
  const months = priced ? Math.round(priced.months * 100) / 100 : 0;
  const total = priced ? priced.total : 0;

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
        setError(errorFor(data));
        setLoading(false);
        return;
      }
      setSuccess(data.booking.id);
    } catch {
      setError(errorFor({}));
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-[48px] mb-4">&#10003;</div>
        <h2 className="text-[22px] font-bold text-heading mb-2">{t("bookingPage.bookingSent")}</h2>
        <p className="text-muted mb-6">
          {t("bookingPage.awaitingConfirmation", { id: success })}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/bookings"
            className="bg-bk-cta text-white font-bold px-5 py-2.5 rounded-[8px] text-[14px] hover:bg-bk-cta-hover transition-colors"
          >
            {t("bookingPage.viewMyBookings")}
          </Link>
          <Link
            href="/search"
            className="border border-border text-heading font-bold px-5 py-2.5 rounded-[8px] text-[14px] hover:bg-feature transition-colors"
          >
            {t("bookingPage.browseMore")}
          </Link>
        </div>
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
          <label className="block text-[13px] font-semibold text-heading mb-1">
            {t("bookingPage.startDate")}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-heading mb-1">
            {t("bookingPage.endDate")}
          </label>
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
          {t("bookingPage.floorArea")}
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
        <label className="block text-[13px] font-semibold text-heading mb-1">{t("bookingPage.notes")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-border rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-bk-cta resize-none"
        />
      </div>

      {total > 0 && (
        <div className="bg-feature rounded-[8px] p-4 text-[14px]">
          <span className="font-bold text-heading">
            {t("bookingPage.estimatedTotal")} <Price amount={total} decimals={0} />
          </span>
          <span className="text-muted ms-2">
            {months === 1
              ? t("bookingPage.breakdownSingular", { months, size: sizeNum })
              : t("bookingPage.breakdownPlural", { months, size: sizeNum })}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-bk-cta text-white font-bold py-3 rounded-[8px] hover:bg-bk-cta-hover disabled:opacity-60 transition-colors"
      >
        {loading ? t("common.processing") : t("bookingPage.confirmBooking")}
      </button>
    </form>
  );
}
