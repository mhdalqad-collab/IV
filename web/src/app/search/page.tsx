import { pool } from "@/lib/db";
import { VALID_TYPES, SORT_MAP } from "@/lib/constants";
import ListingCard from "@/components/listings/ListingCard";
import FilterSidebar from "@/components/search/FilterSidebar";
import HeroSearch from "@/components/home/HeroSearch";
import Pagination from "@/components/listings/Pagination";
import { getServerT } from "@/lib/i18n/server";
import type { Listing } from "@/types";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { t, locale } = await getServerT();
  const numberLocale = locale === "ar" ? "ar-OM" : "en-US";
  const city = sp.city;
  const type = sp.type;
  const max_price = sp.max_price;
  const min_size = sp.min_size;
  const max_size = sp.max_size;
  const min_slots = sp.min_slots;
  const sort = sp.sort;
  const page = sp.page || "1";
  const limit = sp.limit || "20";

  const conditions: string[] = ["is_active = true"];
  const params: unknown[] = [];
  let idx = 1;

  if (city) { conditions.push(`city ILIKE $${idx}`); params.push(`%${city}%`); idx++; }
  if (type && (VALID_TYPES as readonly string[]).includes(type)) { conditions.push(`type = $${idx}`); params.push(type); idx++; }
  if (max_price) { conditions.push(`price_sqm <= $${idx}`); params.push(Number(max_price)); idx++; }
  if (min_size) { conditions.push(`size_sqm >= $${idx}`); params.push(Number(min_size)); idx++; }
  if (max_size) { conditions.push(`size_sqm <= $${idx}`); params.push(Number(max_size)); idx++; }
  if (min_slots) { conditions.push(`slots >= $${idx}`); params.push(Number(min_slots)); idx++; }

  const where = "WHERE " + conditions.join(" AND ");
  const order = SORT_MAP[sort || ""] || "created_at DESC";
  const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const pg = Math.max(parseInt(page) || 1, 1);
  const offset = (pg - 1) * lim;

  const countQ = await pool.query(`SELECT count(*) FROM listings ${where}`, params);
  const total = parseInt(countQ.rows[0].count);
  const pages = Math.ceil(total / lim);

  const { rows: listings } = await pool.query<Listing>(
    `SELECT id, user_id, title, description, type, city, country, size_sqm, slots, price_sqm, currency,
            amenities, images, rating, review_count, free_cancel, insurance, created_at
     FROM listings ${where}
     ORDER BY ${order}
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, lim, offset]
  );

  const formattedTotal = total.toLocaleString(numberLocale);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="mb-6">
        <HeroSearch />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8">
        {/* Sidebar */}
        <aside className="bg-white rounded-[16px] p-5 shadow-sm h-fit md:sticky md:top-4">
          <h3 className="text-[16px] font-bold text-heading mb-4">
            {t("searchPage.filterBy")}
          </h3>
          <FilterSidebar />
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4">
            <h1 className="text-[22px] font-bold text-heading">
              {city ? t("searchPage.storageIn", { city }) : t("searchPage.allSpaces")}
            </h1>
            <p className="text-muted text-[14px]">
              {total === 1
                ? t("searchPage.countSingular", { count: formattedTotal })
                : t("searchPage.countPlural", { count: formattedTotal })}
            </p>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16 text-muted">
              {t("searchPage.empty")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <Pagination currentPage={pg} totalPages={pages} />
          )}
        </div>
      </div>
    </div>
  );
}
