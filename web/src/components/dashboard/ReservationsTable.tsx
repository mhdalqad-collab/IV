"use client";

import type { Booking } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Price from "@/components/currency/Price";

function formatDate(d: string | Date | undefined): string {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-bk-green-soft text-bk-green",
  pending: "bg-bk-amber-soft text-bk-amber",
  cancelled: "bg-bk-red-soft text-bk-red",
  completed: "bg-feature text-muted",
};

export default function ReservationsTable({
  reservations,
}: {
  reservations: Booking[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function confirmBooking(id: number) {
    setLoading(id);
    await fetch(`/api/bookings/${id}/confirm`, { method: "PATCH" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] font-bold text-muted uppercase border-b border-border">
            <th className="py-2 pr-3">Listing</th>
            <th className="py-2 pr-3">Renter</th>
            <th className="py-2 pr-3">Dates</th>
            <th className="py-2 pr-3">Size</th>
            <th className="py-2 pr-3">Total</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-b border-border">
              <td className="py-3 pr-3 font-semibold text-heading">
                {r.listing_title}
              </td>
              <td className="py-3 pr-3">{r.renter_email}</td>
              <td className="py-3 pr-3 whitespace-nowrap">
                {formatDate(r.start_date)} &rarr; {formatDate(r.end_date)}
              </td>
              <td className="py-3 pr-3">{Number(r.size_sqm)} m&sup2;</td>
              <td className="py-3 pr-3 font-semibold">
                <Price amount={Number(r.total_price)} decimals={0} />
              </td>
              <td className="py-3 pr-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-[999px] text-[11px] font-bold ${
                    STATUS_COLORS[r.status] || "bg-feature text-muted"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="py-3">
                {r.status === "pending" && (
                  <button
                    onClick={() => confirmBooking(r.id)}
                    disabled={loading === r.id}
                    className="bg-bk-green text-white text-[12px] font-bold px-3 py-1 rounded-[6px] hover:opacity-90 disabled:opacity-50"
                  >
                    {loading === r.id ? "..." : "Confirm"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
