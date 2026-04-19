import Link from "next/link";
import { pool } from "@/lib/db";
import ListingCard from "@/components/listings/ListingCard";
import HeroSearch from "@/components/home/HeroSearch";
import TypeCarousel from "@/components/home/TypeCarousel";
import type { Listing } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { rows: listings } = await pool.query<Listing>(
    `SELECT id, user_id, title, description, type, city, country, size_sqm, price_sqm, currency,
            amenities, images, rating, review_count, free_cancel, insurance, created_at
     FROM listings WHERE is_active = true
     ORDER BY rating DESC LIMIT 6`
  );

  const countResult = await pool.query(
    "SELECT count(*) FROM listings WHERE is_active = true"
  );
  const totalCount = parseInt(countResult.rows[0].count);

  return (
    <>
      {/* Hero */}
      <div className="bg-bk-blue text-white pb-12">
        <div className="max-w-[1280px] mx-auto px-6 pt-10">
          <h1 className="text-[42px] font-extrabold leading-tight mb-3">
            Find your suitable storage
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl">
            Search {totalCount.toLocaleString()} verified warehouses, containers, and
            industrial spaces — priced live by the market.
          </p>
          <HeroSearch />
        </div>
      </div>

      {/* Why Selk */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-6">Why Selk?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Book now, pay on move-in", desc: "Free cancellation up to 48 hours before check-in on most listings. No surprise fees." },
              { title: "18,500+ verified reviews", desc: "Trusted feedback from logistics teams, SMEs, and production companies across Europe." },
              { title: `${totalCount.toLocaleString()} listings in 86 countries`, desc: "Warehouses, containers, climate-controlled vaults, and back-of-house space worldwide." },
              { title: "Market-driven pricing", desc: "Our pricing engine refreshes every 15 minutes — you only ever pay (or earn) a fair rate." },
            ].map((f) => (
              <div key={f.title} className="bg-feature rounded-[16px] p-5">
                <h3 className="text-[15px] font-bold text-heading mb-2">{f.title}</h3>
                <p className="text-[13px] text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-2">Offers</h2>
          <p className="text-muted text-[14px] mb-6">Promotions, deals, and volume discounts for your team</p>
          <div className="grid grid-cols-[1fr_400px] bg-bk-cta rounded-[24px] overflow-hidden text-white">
            <div className="p-8">
              <div className="text-[11px] font-bold tracking-wider opacity-80 mb-3">
                LIMITED TIME &middot; BOOK BY 30 APRIL
              </div>
              <h2 className="text-[26px] font-extrabold mb-3">
                Save at least 15% on long-term storage.
              </h2>
              <p className="text-white/80 text-[14px] mb-6 max-w-md">
                Lock in a 90-day booking this month and get 15% off the multiplier on any warehouse in Berlin, Rotterdam, or Milan.
              </p>
              <Link
                href="/search"
                className="inline-block bg-white text-bk-cta font-bold px-5 py-3 rounded-[8px] text-[14px] hover:bg-white/90 transition-colors"
              >
                Find a getaway deal
              </Link>
            </div>
            <div
              className="bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80')" }}
            />
          </div>
        </div>
      </section>

      {/* Browse by type */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-6">Browse by storage type</h2>
          <TypeCarousel />
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-1">
            This week on the market
          </h2>
          <p className="text-muted text-[14px] mb-6">
            {totalCount} active spaces — refreshed every 15 minutes
          </p>
          <div className="flex flex-col gap-4">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
          <div className="flex justify-center mt-7">
            <Link
              href="/search"
              className="border-2 border-bk-cta text-bk-cta font-bold px-6 py-3 rounded-[8px] hover:bg-bk-cta-soft transition-colors"
            >
              View all listings
            </Link>
          </div>
        </div>
      </section>

      {/* Loyalty CTA */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-bk-blue rounded-[24px] p-8 text-white flex items-center justify-between">
            <div>
              <span className="inline-block bg-bk-amber text-bk-blue text-[11px] font-extrabold px-2 py-0.5 rounded-[999px] mb-3">
                Selk Pro
              </span>
              <h2 className="text-[24px] font-extrabold mb-2">Save more, store more.</h2>
              <p className="text-white/70 text-[14px] max-w-lg">
                Sign up your company for free and unlock Selk Pro: instant 10% off at participating properties, priority KYB verification, and consolidated invoicing.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="bg-white text-bk-blue font-bold px-5 py-3 rounded-[8px] text-[14px]">
                Sign in
              </Link>
              <Link href="/signup" className="border border-white/40 text-white font-bold px-5 py-3 rounded-[8px] text-[14px]">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
