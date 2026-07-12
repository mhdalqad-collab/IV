"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import Price from "@/components/currency/Price";
import type { MapListing } from "@/lib/omanCities";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Listings that fall on the same coordinates (same-city fallback) are fanned
// out in a small ring so no pin hides another.
function positions(listings: MapListing[]): [number, number][] {
  const groups = new Map<string, number[]>();
  listings.forEach((l, i) => {
    const key = `${l.lat.toFixed(4)},${l.lng.toFixed(4)}`;
    const g = groups.get(key) ?? [];
    g.push(i);
    groups.set(key, g);
  });
  return listings.map((l, i) => {
    const g = groups.get(`${l.lat.toFixed(4)},${l.lng.toFixed(4)}`)!;
    if (g.length === 1) return [l.lat, l.lng];
    const angle = (2 * Math.PI * g.indexOf(i)) / g.length;
    return [l.lat + 0.012 * Math.sin(angle), l.lng + 0.012 * Math.cos(angle)];
  });
}

export default function OmanMap({ listings }: { listings: MapListing[] }) {
  const { t } = useLocale();
  const pos = positions(listings);

  return (
    <div className="relative">
      <MapContainer
        center={[21.0, 57.0]}
        zoom={6}
        scrollWheelZoom
        className="h-[600px] w-full rounded-[16px] overflow-hidden border border-border"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listings.map((l, i) => (
          <Marker key={l.id} position={pos[i]}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <Link
                  href={`/listing/${l.id}`}
                  style={{ fontWeight: 700, fontSize: 14 }}
                >
                  {l.title}
                </Link>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                  {l.city} ·{" "}
                  {t(`listingType.${l.type}` as TranslationKey)}
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  <Price amount={l.priceSqm} />
                  /m² · {l.sizeSqm.toLocaleString()} m²
                </div>
                {l.approx && (
                  <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                    {t("routeOptPage.approx")}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {listings.length === 0 && (
        <div className="absolute inset-x-0 top-4 z-[1000] flex justify-center pointer-events-none">
          <span className="bg-white/95 text-muted text-[13px] font-semibold px-4 py-2 rounded-pill border border-border shadow-sm">
            {t("routeOptPage.empty")}
          </span>
        </div>
      )}
    </div>
  );
}
