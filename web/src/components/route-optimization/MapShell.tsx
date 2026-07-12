"use client";

import dynamic from "next/dynamic";
import type { MapListing } from "@/lib/omanCities";

const OmanMap = dynamic(() => import("./OmanMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-feature rounded-[16px] animate-pulse" />
  ),
});

export default function MapShell({ listings }: { listings: MapListing[] }) {
  return <OmanMap listings={listings} />;
}
