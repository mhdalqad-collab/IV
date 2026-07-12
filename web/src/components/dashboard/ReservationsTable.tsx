"use client";

import type { Booking } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Price from "@/components/currency/Price";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

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
  const t = useT();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function confirmBooking(id: number) {
    setLoading(id);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${id}/confirm`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "insufficient_capacity"
            ? t("reservations.insufficientCapacity", {
                available: data.available ?? 0,
              })
            : t("common.somethingWrong")
        );
      }
    } catch {
      setError(t("common.somethingWrong"));
    }
    setLoading(null);
    router.refresh();
  }

  function statusLabel(status: string) {
    const key = `bookingStatus.${status}` as TranslationKey;
    const v = t(key);
    return v === key ? status : v;
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="bg-bk-red-soft text-bk-red p-3 rounded-[8px] text-[13px] font-semibold mb-3">
          {error}
        </div>
      )}
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-start text-[11px] font-bold text-muted uppercase border-b border-border">
            <th className="py-2 pe-3 text-start">{t("reservations.listing")}</th>
            <th className="py-2 pe-3 text-start">{t("reservations.renter")}</th>
            <th className="py-2 pe-3 text-start">{t("reservations.dates")}</th>
            <th className="py-2 pe-3 text-start">{t("reservations.size")}</th>
            <th className="py-2 pe-3 text-start">{t("reservations.total")}</th>
            <th className="py-2 pe-3 text-start">{t("reservations.status")}</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-b border-border">
              <td className="py-3 pe-3 font-semibold text-heading">
                {r.listing_title}
              </td>
              <td className="py-3 pe-3">{r.renter_email}</td>
              <td className="py-3 pe-3 whitespace-nowrap">
                {formatDate(r.start_date)} &rarr; {formatDate(r.end_date)}
              </td>
              <td className="py-3 pe-3">{Number(r.size_sqm)} {t("common.sqm")}</td>
              <td className="py-3 pe-3 font-semibold">
                <Price amount={Number(r.total_price)} decimals={0} />
              </td>
              <td className="py-3 pe-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-[999px] text-[11px] font-bold ${
                    STATUS_COLORS[r.status] || "bg-feature text-muted"
                  }`}
                >
                  {statusLabel(r.status)}
                </span>
              </td>
              <td className="py-3">
                {r.status === "pending" && (
                  <button
                    onClick={() => confirmBooking(r.id)}
                    disabled={loading === r.id}
                    className="bg-bk-green text-white text-[12px] font-bold px-3 py-1 rounded-[6px] hover:opacity-90 disabled:opacity-50"
                  >
                    {loading === r.id ? "..." : t("reservations.confirm")}
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
