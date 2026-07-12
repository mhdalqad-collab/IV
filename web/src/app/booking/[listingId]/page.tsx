import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import BookingForm from "@/components/booking/BookingForm";
import { getServerT } from "@/lib/i18n/server";
import Price from "@/components/currency/Price";
import type { TranslationKey } from "@/lib/i18n";
import type { Listing } from "@/types";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const id = parseInt(listingId);
  if (!id) notFound();

  const { rows } = await pool.query<Listing>(
    "SELECT * FROM listings WHERE id = $1 AND is_active = true",
    [id]
  );
  if (!rows.length) notFound();
  const listing = rows[0];

  const { t } = await getServerT();
  const typeLabel = t(`listingType.${listing.type}` as TranslationKey) || listing.type;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="text-[24px] font-bold text-heading mb-6">{t("bookingPage.title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 md:gap-8">
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-border order-last md:order-first">
          <BookingForm listing={listing} />
        </div>
        <div className="md:sticky md:top-4 h-fit order-first md:order-last">
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-bold text-heading mb-2">
              {listing.title}
            </h3>
            <p className="text-[13px] text-muted mb-3">
              {listing.city}, {listing.country} &middot; {typeLabel}
            </p>
            <Price
              amount={Number(listing.price_sqm)}
              decimals={2}
              className="text-[22px] font-extrabold text-heading block"
            />
            <div className="text-[12px] text-muted">{t("common.perSqmPerMonth")}</div>
            {listing.free_cancel && (
              <div className="mt-3 text-[13px] text-bk-green font-semibold">
                {t("common.freeCancellation")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
