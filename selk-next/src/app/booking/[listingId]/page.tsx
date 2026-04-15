import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import BookingForm from "@/components/booking/BookingForm";
import { TYPE_LABELS } from "@/lib/constants";
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

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <h1 className="text-[24px] font-bold text-heading mb-6">Book storage space</h1>
      <div className="grid grid-cols-[1fr_380px] gap-8">
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-border">
          <BookingForm listing={listing} />
        </div>
        <div className="sticky top-4 h-fit">
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-border">
            <h3 className="text-[16px] font-bold text-heading mb-2">
              {listing.title}
            </h3>
            <p className="text-[13px] text-muted mb-3">
              {listing.city}, {listing.country} &middot;{" "}
              {TYPE_LABELS[listing.type] || listing.type}
            </p>
            <div className="text-[22px] font-extrabold text-heading">
              &euro;{Number(listing.price_sqm).toFixed(2)}
            </div>
            <div className="text-[12px] text-muted">per m&sup2; / month</div>
            {listing.free_cancel && (
              <div className="mt-3 text-[13px] text-bk-green font-semibold">
                Free cancellation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
