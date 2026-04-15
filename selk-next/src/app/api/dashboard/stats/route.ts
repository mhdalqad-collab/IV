import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = session.user.id;

  try {
    const listings = await pool.query(
      "SELECT count(*) as total, count(*) FILTER (WHERE is_active) as active FROM listings WHERE user_id = $1",
      [userId]
    );
    const bookings = await pool.query(
      `SELECT count(*) as total,
              count(*) FILTER (WHERE status = 'pending') as pending,
              count(*) FILTER (WHERE status = 'confirmed') as confirmed,
              COALESCE(SUM(total_price) FILTER (WHERE status IN ('confirmed','completed')), 0) as revenue
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE l.user_id = $1`,
      [userId]
    );
    const rating = await pool.query(
      `SELECT COALESCE(AVG(r.rating), 0) as avg_rating, count(r.id) as review_count
       FROM reviews r JOIN listings l ON l.id = r.listing_id
       WHERE l.user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      listings: {
        total: parseInt(listings.rows[0].total),
        active: parseInt(listings.rows[0].active),
      },
      bookings: {
        total: parseInt(bookings.rows[0].total),
        pending: parseInt(bookings.rows[0].pending),
        confirmed: parseInt(bookings.rows[0].confirmed),
      },
      revenue: parseFloat(bookings.rows[0].revenue),
      avg_rating: parseFloat(
        parseFloat(rating.rows[0].avg_rating).toFixed(1)
      ),
      review_count: parseInt(rating.rows[0].review_count),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
