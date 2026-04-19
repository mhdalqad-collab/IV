import { notFound } from "next/navigation";
import Link from "next/link";
import { pool } from "@/lib/db";
import { ratingLabel, starCount } from "@/lib/utils";
import { TYPE_LABELS } from "@/lib/constants";
import Price from "@/components/currency/Price";
import type { Listing, Review } from "@/types";

export const dynamic = "force-dynamic";

const PLACEHOLDER = "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = parseInt(id);
  if (!listingId) notFound();

  const { rows } = await pool.query<Listing>(
    `SELECT l.*, u.email as owner_email
     FROM listings l JOIN users u ON u.id = l.user_id
     WHERE l.id = $1 AND l.is_active = true`,
    [listingId]
  );
  if (!rows.length) notFound();
  const listing = rows[0];

  const { rows: reviews } = await pool.query<Review>(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.email as reviewer
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.listing_id = $1 ORDER BY r.created_at DESC`,
    [listingId]
  );

  const img = listing.images?.[0] || PLACEHOLDER;
  const label = ratingLabel(Number(listing.rating));
  const stars = starCount(Number(listing.rating));

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Hero image */}
      <div className="h-[400px] rounded-[24px] overflow-hidden mb-8">
        <img src={img} alt={listing.title} className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-8">
        {/* Main content */}
        <div>
          <div className="text-[13px] text-muted mb-1">
            {listing.city}, {listing.country} &middot; {TYPE_LABELS[listing.type] || listing.type} &middot; {Number(listing.size_sqm)} m&sup2;
          </div>
          <h1 className="text-[28px] font-extrabold text-heading mb-4">
            {listing.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-bk-cta text-white text-[16px] font-bold w-10 h-10 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[8px] flex items-center justify-center">
              {Number(listing.rating).toFixed(1)}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-heading">{label}</div>
              <div className="text-[12px] text-muted">{listing.review_count} reviews</div>
            </div>
            <div className="flex text-bk-star ml-2">
              {Array.from({ length: stars }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-[18px] font-bold text-heading mb-2">About this space</h2>
            <p className="text-[14px] text-body leading-relaxed">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[18px] font-bold text-heading mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span key={a} className="bg-feature text-body text-[13px] font-medium px-3 py-1.5 rounded-[999px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-[18px] font-bold text-heading mb-4">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-[16px] p-5 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-semibold text-heading">{r.reviewer}</span>
                      <span className="bg-bk-cta text-white text-[13px] font-bold px-2 py-0.5 rounded-[6px]">
                        {r.rating}/10
                      </span>
                    </div>
                    <p className="text-[13px] text-body">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky booking panel */}
        <div className="sticky top-4 h-fit">
          <div className="bg-white rounded-[16px] p-6 shadow-md border border-border">
            <Price
              amount={Number(listing.price_sqm)}
              decimals={2}
              className="text-[28px] font-extrabold text-heading mb-1 block"
            />
            <div className="text-[13px] text-muted mb-4">per m&sup2; / month</div>

            {listing.free_cancel && (
              <div className="flex items-center gap-2 text-[13px] text-bk-green font-semibold mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Free cancellation
              </div>
            )}
            {listing.insurance && (
              <div className="flex items-center gap-2 text-[13px] text-bk-green font-semibold mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Insurance included
              </div>
            )}

            <Link
              href={`/booking/${listing.id}`}
              className="block w-full bg-bk-cta text-white text-center font-bold py-3.5 rounded-[8px] hover:bg-bk-cta-hover transition-colors text-[15px]"
            >
              Book this space
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
