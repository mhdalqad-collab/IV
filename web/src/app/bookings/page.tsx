import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { pool } from "@/lib/db";
import Price from "@/components/currency/Price";
import CancelBookingButton from "@/components/bookings/CancelBookingButton";
import { getServerT } from "@/lib/i18n/server";
import type { TranslationKey } from "@/lib/i18n";
import type { ListingType } from "@/lib/constants";
import type { Booking } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-bk-amber-soft text-bk-amber",
  confirmed: "bg-bk-green-soft text-bk-green",
  cancelled: "bg-bk-red-soft text-bk-red",
  completed: "bg-feature text-muted",
};

function fmt(d: string | Date | undefined) {
  if (!d) return "";
  return String(d).slice(0, 10);
}

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/bookings");

  const { t } = await getServerT();

  const { rows: rawBookings } = await pool.query<Booking & { type: ListingType }>(
    `SELECT b.*, l.title as listing_title, l.city, l.type, l.images, l.address, l.price_sqm
     FROM bookings b JOIN listings l ON l.id = b.listing_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [session.user.id]
  );
  const bookings = JSON.parse(JSON.stringify(rawBookings)) as (Booking & {
    type: ListingType;
  })[];

  function statusLabel(status: string) {
    switch (status) {
      case "pending":
        return t("bookingStatus.pendingFull");
      case "confirmed":
        return t("bookingStatus.confirmed");
      case "cancelled":
        return t("bookingStatus.cancelled");
      case "completed":
        return t("bookingStatus.completed");
      default:
        return status;
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold text-heading">{t("myBookings.title")}</h1>
        <p className="text-muted text-[14px]">{t("myBookings.subtitle")}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-border rounded-[16px] p-12 text-center">
          <p className="text-muted text-[15px] mb-4">{t("myBookings.empty")}</p>
          <Link
            href="/search"
            className="inline-block bg-bk-cta text-white font-bold px-5 py-2.5 rounded-[8px] text-[14px] hover:bg-bk-cta-hover transition-colors"
          >
            {t("myBookings.browseListings")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const canCancel = b.status === "pending" || b.status === "confirmed";
            const typeLabel = t(`listingType.${b.type}` as TranslationKey) || b.type;
            return (
              <div
                key={b.id}
                className="bg-white border border-border rounded-[16px] p-5 grid grid-cols-[1fr_auto] gap-4 items-start"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/listing/${b.listing_id}`}
                      className="text-[16px] font-bold text-heading hover:text-bk-cta"
                    >
                      {b.listing_title}
                    </Link>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[999px] text-[11px] font-bold ${
                        STATUS_COLORS[b.status] || "bg-feature text-muted"
                      }`}
                    >
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <div className="text-[13px] text-muted flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      {typeLabel} &middot; {b.city}
                    </span>
                    <span>
                      {fmt(b.start_date)} &rarr; {fmt(b.end_date)}
                    </span>
                    <span>{Number(b.size_sqm)} {t("common.sqm")}</span>
                    <span className="font-semibold text-heading">
                      {t("myBookings.total")} <Price amount={Number(b.total_price)} decimals={0} />
                    </span>
                  </div>
                  <div className="text-[12px] text-muted">
                    {t("myBookings.bookingMeta", { id: b.id, date: fmt(b.created_at) })}
                  </div>
                  {b.notes && (
                    <div className="text-[12px] text-muted italic">
                      &ldquo;{b.notes}&rdquo;
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/listing/${b.listing_id}`}
                    className="text-[12px] font-semibold text-bk-cta hover:underline"
                  >
                    {t("myBookings.viewListing")}
                  </Link>
                  {canCancel && <CancelBookingButton id={b.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
