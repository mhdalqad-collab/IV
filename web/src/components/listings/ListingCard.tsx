import Link from "next/link";
import type { Listing } from "@/types";
import { ratingLabel, starCount, monthlyEstimate } from "@/lib/utils";
import { TYPE_LABELS } from "@/lib/constants";
import Price from "@/components/currency/Price";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
  "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80",
  "https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80",
];

export default function ListingCard({
  listing,
  index = 0,
}: {
  listing: Listing;
  index?: number;
}) {
  const img =
    listing.images?.[0] || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const label = ratingLabel(Number(listing.rating));
  const stars = starCount(Number(listing.rating));
  const estimate = monthlyEstimate(
    Number(listing.price_sqm),
    Number(listing.size_sqm)
  );
  const amenities = listing.amenities?.slice(0, 3) || [];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="grid grid-cols-[280px_1fr_240px] bg-white border border-border rounded-[24px] overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={img}
          alt={listing.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {listing.free_cancel && (
          <span className="absolute top-3 left-3 bg-bk-green text-white text-[11px] font-bold px-2 py-0.5 rounded-[999px]">
            Free cancellation
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <div className="text-[12px] text-muted mb-1">
            {listing.city}, {listing.country} &middot;{" "}
            {TYPE_LABELS[listing.type] || listing.type}
          </div>
          <h3 className="text-[16px] font-bold text-heading leading-snug mb-2">
            {listing.title}
          </h3>
          <div className="text-[13px] text-muted mb-3 line-clamp-2">
            {listing.description}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span
                key={a}
                className="bg-feature text-muted text-[11px] font-medium px-2 py-0.5 rounded-[999px]"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[12px] text-muted">
          {listing.size_sqm && <span>{Number(listing.size_sqm)} m&sup2;</span>}
          {listing.insurance && (
            <span className="text-bk-green font-semibold">Insured</span>
          )}
        </div>
      </div>

      {/* Price + Rating */}
      <div className="p-5 flex flex-col justify-between items-end border-l border-border">
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[12px] font-semibold text-heading">
              {label}
            </div>
            <div className="text-[11px] text-muted">
              {listing.review_count} reviews
            </div>
          </div>
          <div className="bg-bk-cta text-white text-[14px] font-bold w-9 h-9 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[8px] flex items-center justify-center">
            {Number(listing.rating).toFixed(1)}
          </div>
        </div>
        <div className="flex text-bk-star">
          {Array.from({ length: stars }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27 5.23 15.71l.91-5.32L2.27 6.62l5.34-.78z" />
            </svg>
          ))}
        </div>
        <div className="text-right mt-auto">
          <div className="text-[12px] text-muted">from</div>
          <Price
            amount={estimate}
            decimals={0}
            className="text-[22px] font-extrabold text-heading block"
          />
          <div className="text-[11px] text-muted">per month estimate</div>
          <div className="mt-3 bg-bk-cta text-white text-[13px] font-bold px-4 py-2 rounded-[8px] text-center">
            See availability &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}
