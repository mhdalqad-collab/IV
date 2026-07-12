import { pool } from "@/lib/db";
import { resolveCityCoords, type MapListing } from "@/lib/omanCities";

// Active listings with a resolvable position: exact lat/lng from the row when
// present, otherwise the city center. Rows whose city we can't geocode are
// skipped rather than pinned somewhere wrong.
export async function getMapListings(): Promise<MapListing[]> {
  const { rows } = await pool.query(
    `SELECT id, title, city, type, price_sqm, size_sqm, lat, lng
       FROM listings
      WHERE is_active = true
      ORDER BY created_at DESC`
  );

  const out: MapListing[] = [];
  for (const r of rows) {
    let lat = r.lat == null ? null : Number(r.lat);
    let lng = r.lng == null ? null : Number(r.lng);
    let approx = false;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      const c = resolveCityCoords(r.city);
      if (!c) continue;
      lat = c.lat;
      lng = c.lng;
      approx = true;
    }
    out.push({
      id: Number(r.id),
      title: r.title,
      city: r.city,
      type: r.type,
      priceSqm: Number(r.price_sqm),
      sizeSqm: Number(r.size_sqm),
      lat,
      lng,
      approx,
    });
  }
  return out;
}
