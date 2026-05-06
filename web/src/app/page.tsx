import Link from "next/link";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import ListingCard from "@/components/listings/ListingCard";
import TypeCarousel from "@/components/home/TypeCarousel";
import CategoryNav from "@/components/layout/CategoryNav";
import MapShell from "@/components/route-optimization/MapShell";
import type { Listing } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const isSignedIn = !!session?.user;
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
          <h1 className="text-[28px] sm:text-[34px] md:text-[42px] font-extrabold leading-tight mb-3">
            Find your suitable storage
          </h1>
          <p className="text-white/70 text-[14px] md:text-[16px] mb-6 md:mb-8 max-w-xl">
            Search {totalCount.toLocaleString()} verified warehouses, containers, and
            industrial spaces — priced live by the market.
          </p>
          <CategoryNav />
        </div>
      </div>

      {/* Why Selk */}
      <section className="py-14 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-left mb-10">
            <h2 className="text-[26px] sm:text-[32px] font-extrabold text-heading">
              Why <span className="text-bk-cta">Selk</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                ),
                title: "Intelligent AI Systems",
                desc: "Custom AI solutions that automate processes, enhance decision-making, and unlock new capabilities for your business.",
                color: "bg-bk-amber-soft",
                iconColor: "text-bk-amber",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                ),
                title: "Custom Applications",
                desc: "Web, mobile, and enterprise applications built from scratch to match your exact requirements and scale with your growth.",
                color: "bg-bk-cta-soft",
                iconColor: "text-bk-cta",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                  </svg>
                ),
                title: "Cloud Infrastructure",
                desc: "Robust, scalable cloud solutions on AWS, Azure, or GCP — designed for security, performance, and cost efficiency.",
                color: "bg-bk-green-soft",
                iconColor: "text-bk-green",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                  </svg>
                ),
                title: "Data & Analytics",
                desc: "Turn your data into actionable insights with modern data pipelines, dashboards, and machine learning models.",
                color: "bg-bk-cta-soft",
                iconColor: "text-bk-cta",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                ),
                title: "Technical Consulting",
                desc: "Strategic guidance on architecture, technology stack, and digital transformation to help you make the right decisions.",
                color: "bg-bk-green-soft",
                iconColor: "text-bk-green",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="!w-6 !h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: "Security & Reliability",
                desc: "Enterprise-grade security practices, 99.9% uptime SLAs, and continuous monitoring to keep your systems running flawlessly.",
                color: "bg-bk-amber-soft",
                iconColor: "text-bk-amber",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative bg-feature rounded-[20px] p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${item.color} rounded-[14px] flex items-center justify-center mb-4 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-[16px] font-bold text-heading mb-2">{item.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-6">What we offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Marketplace", desc: "Book verified warehouses, containers, and industrial space across Oman at market-driven prices." },
              { title: "Route Optimization", desc: "Interactive map of Oman's commercial hubs and ports — plan logistics across Muscat, Sohar, Duqm, and Salalah." },
              { title: "Dashboards", desc: "Live operational dashboards for your bookings, occupancy, and earnings — refreshed every 15 minutes." },
              { title: "AI Forecasting", desc: "Demand and price forecasts for industrial storage so you can list, book, and price with confidence." },
            ].map((f) => (
              <div key={f.title} className="bg-feature rounded-[16px] p-5">
                <h3 className="text-[15px] font-bold text-heading mb-2">{f.title}</h3>
                <p className="text-[13px] text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Route Optimization map preview */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-[22px] font-bold text-heading mb-1">Route Optimization</h2>
              <p className="text-muted text-[14px] max-w-[680px]">
                Major commercial hubs and ports across Oman — Muscat, Sohar, Duqm, Salalah, Nizwa, Sur, and more.
              </p>
            </div>
            <Link
              href="/route-optimization"
              className="hidden md:inline-block border-2 border-bk-cta text-bk-cta font-bold px-5 py-2.5 rounded-[8px] text-[13px] hover:bg-bk-cta-soft transition-colors whitespace-nowrap"
            >
              Open full map
            </Link>
          </div>
          <MapShell />
        </div>
      </section>

      {/* Offers */}
      <section className="py-10 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-[22px] font-bold text-heading mb-2">Offers</h2>
          <p className="text-muted text-[14px] mb-6">Promotions, deals, and volume discounts for your team</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] bg-bk-cta rounded-[24px] overflow-hidden text-white">
            <div className="p-6 md:p-8 order-2 md:order-1">
              <div className="text-[11px] font-bold tracking-wider opacity-80 mb-3">
                LIMITED TIME &middot; BOOK BY 30 APRIL
              </div>
              <h2 className="text-[22px] md:text-[26px] font-extrabold mb-3">
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
              className="bg-cover bg-center min-h-[180px] md:min-h-0 order-1 md:order-2"
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
              <h2 className="text-[24px] font-extrabold mb-2">
                {isSignedIn ? "Welcome back." : "Save more, store more."}
              </h2>
              <p className="text-white/70 text-[14px] max-w-lg">
                {isSignedIn
                  ? "Manage your listings, track reservations, and review earnings in your dashboard."
                  : "Sign up your company for free and unlock Selk Pro: instant 10% off at participating properties, priority KYB verification, and consolidated invoicing."}
              </p>
            </div>
            <div className="flex gap-3">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-white text-bk-blue font-bold px-5 py-3 rounded-[8px] text-[14px]"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    href="/search"
                    className="border border-white/40 text-white font-bold px-5 py-3 rounded-[8px] text-[14px]"
                  >
                    Browse listings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-white text-bk-blue font-bold px-5 py-3 rounded-[8px] text-[14px]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="border border-white/40 text-white font-bold px-5 py-3 rounded-[8px] text-[14px]"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
