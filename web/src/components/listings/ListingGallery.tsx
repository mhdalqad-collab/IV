"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/LocaleProvider";

type Media = { type: "image" | "video"; url: string };

export default function ListingGallery({
  images,
  videos,
  title,
}: {
  images: string[];
  videos: string[];
  title: string;
}) {
  const t = useT();
  const media: Media[] = [
    ...(images || []).map((url) => ({ type: "image" as const, url })),
    ...(videos || []).map((url) => ({ type: "video" as const, url })),
  ];
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div className="h-[240px] md:h-[400px] rounded-[24px] overflow-hidden mb-6 md:mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80"
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div className="mb-6 md:mb-8">
      {/* Main stage */}
      <div className="relative h-[260px] md:h-[440px] rounded-[24px] overflow-hidden bg-black">
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={current.url}
            controls
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${m.type} ${i + 1}`}
              className={`relative flex-shrink-0 w-20 h-16 md:w-24 md:h-20 rounded-[10px] overflow-hidden border-2 transition-colors ${
                i === active ? "border-bk-cta" : "border-transparent hover:border-border"
              }`}
            >
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video src={m.url} muted preload="metadata" className="w-full h-full object-cover bg-black" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/55 text-white rounded-full w-7 h-7 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </>
              )}
            </button>
          ))}
          <span className="sr-only">{t("common.video")}</span>
        </div>
      )}
    </div>
  );
}
