"use client";

import { useRef } from "react";
import Link from "next/link";

const types = [
  { type: "warehouse", label: "Warehouses", count: "1,840 spaces", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80" },
  { type: "container", label: "Containers", count: "612 spaces", img: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80" },
  { type: "climate", label: "Climate-controlled", count: "389 spaces", img: "https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80" },
  { type: "basement", label: "Basements & cellars", count: "974 spaces", img: "https://images.unsplash.com/photo-1591588582259-e675bd2e6088?w=600&q=80" },
  { type: "garage", label: "Garages", count: "216 spaces", img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80" },
  { type: "outdoor", label: "Outdoor / Yard", count: "186 spaces", img: "https://images.unsplash.com/photo-1580674684089-5c8b0a9c0b3b?w=600&q=80" },
  { type: "", label: "Bonded & customs", count: "92 spaces", img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80" },
  { type: "", label: "Studio & archive", count: "304 spaces", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80" },
];

export default function TypeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-feature transition-colors"
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none px-6"
        style={{ scrollbarWidth: "none" }}
      >
        {types.map((t) => (
          <Link
            key={t.label}
            href={t.type ? `/search?type=${t.type}` : "/search"}
            className="relative flex-shrink-0 w-[200px] h-[260px] rounded-[16px] overflow-hidden group"
          >
            <img
              src={t.img}
              alt={t.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-[15px] font-bold">{t.label}</div>
              <div className="text-[12px] opacity-80">{t.count}</div>
            </div>
          </Link>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-feature transition-colors"
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
