import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReservationsTable from "@/components/dashboard/ReservationsTable";
import CreateListingForm from "@/components/dashboard/CreateListingForm";
import ListingActions from "@/components/dashboard/ListingActions";
import { getServerT } from "@/lib/i18n/server";
import Price from "@/components/currency/Price";
import type { TranslationKey } from "@/lib/i18n";
import type { Listing, Booking, DashboardStats } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const { t } = await getServerT();

  // Stats
  const listingsQ = await pool.query(
    "SELECT count(*) as total, count(*) FILTER (WHERE is_active) as active FROM listings WHERE user_id = $1",
    [userId]
  );
  const bookingsQ = await pool.query(
    `SELECT count(*) as total,
            count(*) FILTER (WHERE status = 'pending') as pending,
            count(*) FILTER (WHERE status = 'confirmed') as confirmed,
            COALESCE(SUM(total_price) FILTER (WHERE status IN ('confirmed','completed')), 0) as revenue
     FROM bookings b JOIN listings l ON l.id = b.listing_id WHERE l.user_id = $1`,
    [userId]
  );

  const stats: DashboardStats = {
    listings: {
      total: parseInt(listingsQ.rows[0].total),
      active: parseInt(listingsQ.rows[0].active),
    },
    bookings: {
      total: parseInt(bookingsQ.rows[0].total),
      pending: parseInt(bookingsQ.rows[0].pending),
      confirmed: parseInt(bookingsQ.rows[0].confirmed),
    },
    revenue: parseFloat(bookingsQ.rows[0].revenue),
    avg_rating: 0,
    review_count: 0,
  };

  // Listings
  const { rows: rawListings } = await pool.query<Listing>(
    `SELECT l.*,
            (SELECT count(*) FROM bookings b WHERE b.listing_id = l.id AND b.status != 'cancelled') as booking_count
     FROM listings l WHERE l.user_id = $1 ORDER BY l.created_at DESC`,
    [userId]
  );
  const listings = JSON.parse(JSON.stringify(rawListings)) as Listing[];

  // Reservations
  const { rows: rawReservations } = await pool.query<Booking>(
    `SELECT b.*, l.title as listing_title, l.city, u.email as renter_email
     FROM bookings b JOIN listings l ON l.id = b.listing_id JOIN users u ON u.id = b.user_id
     WHERE l.user_id = $1 ORDER BY b.created_at DESC`,
    [userId]
  );
  const reservations = JSON.parse(JSON.stringify(rawReservations)) as Booking[];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("dashboard.kpi.activeListings"), value: stats.listings.active as number | string, isPrice: false },
          { label: t("dashboard.kpi.totalBookings"), value: stats.bookings.total as number | string, isPrice: false },
          { label: t("dashboard.kpi.pending"), value: stats.bookings.pending as number | string, isPrice: false },
          { label: t("dashboard.kpi.revenue"), value: stats.revenue, isPrice: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-[16px] p-5 border border-border">
            <div className="text-[12px] font-semibold text-muted mb-1">{kpi.label}</div>
            <div className="text-[24px] font-extrabold text-heading">
              {kpi.isPrice ? (
                <Price amount={Number(kpi.value)} decimals={0} />
              ) : (
                kpi.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* My Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-heading">{t("dashboard.myListings")}</h2>
          <CreateListingForm />
        </div>
        <div className="bg-white rounded-[16px] border border-border overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead>
              <tr className="text-start text-[11px] font-bold text-muted uppercase border-b border-border">
                <th className="p-3 text-start">{t("dashboard.table.title")}</th>
                <th className="p-3 text-start">{t("dashboard.table.city")}</th>
                <th className="p-3 text-start">{t("dashboard.table.type")}</th>
                <th className="p-3 text-start">{t("dashboard.table.size")}</th>
                <th className="p-3 text-start">{t("dashboard.table.pricePerSqm")}</th>
                <th className="p-3 text-start">{t("dashboard.table.bookings")}</th>
                <th className="p-3 text-start">{t("dashboard.table.status")}</th>
                <th className="p-3 text-start">{t("dashboard.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-border hover:bg-feature/50">
                  <td className="p-3">
                    <Link href={`/listing/${l.id}`} className="font-semibold text-bk-cta hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="p-3">{l.city}</td>
                  <td className="p-3">{t(`listingType.${l.type}` as TranslationKey) || l.type}</td>
                  <td className="p-3">{Number(l.size_sqm)} {t("common.sqm")}</td>
                  <td className="p-3"><Price amount={Number(l.price_sqm)} decimals={2} /></td>
                  <td className="p-3">{l.booking_count || 0}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-bold ${l.is_active ? "text-bk-green" : "text-bk-red"}`}>
                      {l.is_active ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                  <td className="p-3">
                    <ListingActions listing={l} />
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">
                    {t("dashboard.noListings")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservations */}
      <div>
        <h2 className="text-[18px] font-bold text-heading mb-4">{t("dashboard.reservations")}</h2>
        <div className="bg-white rounded-[16px] border border-border p-4">
          {reservations.length > 0 ? (
            <ReservationsTable reservations={reservations} />
          ) : (
            <p className="text-center text-muted py-8">{t("dashboard.noReservations")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
