"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@/types";
import { starCount, ratingLabelKey } from "@/lib/utils";
import Price from "@/components/currency/Price";
import { useT } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

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
  const t = useT();
  const gallery =
    listing.images && listing.images.length > 0
      ? listing.images
      : [PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]];
  const hasVideo = (listing.videos?.length ?? 0) > 0;
  const [slide, setSlide] = useState(0);
  const go = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSlide((s) => (s + dir + gallery.length) % gallery.length);
  };
  const ratingKey = ratingLabelKey(Number(listing.rating));
  const label = t(`ratingLabel.${ratingKey}` as TranslationKey);
  const stars = starCount(Number(listing.rating));
  const amenities = listing.amenities?.slice(0, 3) || [];
  const typeLabel =
    t(`listingType.${listing.type}` as TranslationKey) || listing.type;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="grid grid-cols-1 md:grid-cols-[280px_1fr_240px] bg-white border border-border rounded-[24px] overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image carousel */}
      <div className="relative h-[200px] md:h-[220px] overflow-hidden group/media">
        {gallery.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={listing.title}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 items-start">
          {listing.free_cancel && (
            <span className="bg-bk-green text-white text-[11px] font-bold px-2 py-0.5 rounded-[999px]">
              {t("common.freeCancellation")}
            </span>
          )}
        </div>
        {hasVideo && (
          <span className="absolute top-3 end-3 flex items-center gap-1 bg-black/65 text-white text-[11px] font-bold px-2 py-0.5 rounded-[999px]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M8 5v14l11-7z" />
            </svg>
            {t("common.video")}
          </span>
        )}

        {/* Carousel controls (only with >1 image) */}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t("common.prev")}
              onClick={(e) => go(e, -1)}
              className="absolute start-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 text-heading flex items-center justify-center shadow opacity-0 group-hover/media:opacity-100 transition-opacity hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={t("common.next")}
              onClick={(e) => go(e, 1)}
              className="absolute end-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 text-heading flex items-center justify-center shadow opacity-0 group-hover/media:opacity-100 transition-opacity hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slide ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <div className="text-[12px] text-muted mb-1">
            {listing.city}, {listing.country} &middot; {typeLabel}
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
          {listing.size_sqm && (
            <span>
              {Number(listing.size_sqm)} {t("common.sqm")}
            </span>
          )}
          {listing.insurance && (
            <span className="text-bk-green font-semibold">
              {t("common.insured")}
            </span>
          )}
        </div>
      </div>

      {/* Price + Rating */}
      <div className="p-5 flex flex-col justify-between items-end border-t md:border-t-0 md:border-s border-border">
        <div className="flex items-center gap-2">
          <div className="text-end">
            <div className="text-[12px] font-semibold text-heading">{label}</div>
            <div className="text-[11px] text-muted">
              {t("common.reviews", { count: listing.review_count })}
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
        <div className="text-end mt-auto">
          <div className="text-[12px] text-muted">{t("common.from")}</div>
          <Price
            amount={Number(listing.price_sqm)}
            className="text-[22px] font-extrabold text-heading block"
          />
          <div className="text-[11px] text-muted">
            {t("common.perSqmPerMonth")}
          </div>
          <div className="mt-3 bg-bk-cta text-white text-[13px] font-bold px-4 py-2 rounded-[8px] text-center">
            {t("common.seeAvailability")}
          </div>
        </div>
      </div>
    </Link>
  );
}
