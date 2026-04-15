import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/bookings — create booking
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await request.json().catch(() => null);
  const { listing_id, start_date, end_date, size_sqm, notes } = body || {};

  if (!listing_id)
    return NextResponse.json({ error: "invalid_listing" }, { status: 400 });
  if (!start_date || !end_date)
    return NextResponse.json({ error: "invalid_dates" }, { status: 400 });
  if (!size_sqm || size_sqm <= 0)
    return NextResponse.json({ error: "invalid_size" }, { status: 400 });

  try {
    const listing = await pool.query(
      "SELECT id, price_sqm, user_id, is_active FROM listings WHERE id = $1",
      [listing_id]
    );
    if (!listing.rows.length || !listing.rows[0].is_active)
      return NextResponse.json(
        { error: "listing_not_found" },
        { status: 404 }
      );
    if (String(listing.rows[0].user_id) === userId)
      return NextResponse.json(
        { error: "cannot_book_own" },
        { status: 400 }
      );

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start)
      return NextResponse.json({ error: "invalid_dates" }, { status: 400 });

    const months = Math.max(
      1,
      Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    );
    const total_price = (
      listing.rows[0].price_sqm *
      size_sqm *
      months
    ).toFixed(2);

    const { rows } = await pool.query(
      `INSERT INTO bookings (listing_id, user_id, start_date, end_date, size_sqm, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [listing_id, userId, start_date, end_date, size_sqm, total_price, notes || ""]
    );
    return NextResponse.json({ booking: rows[0] }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// GET /api/bookings — list user's bookings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, l.type, l.images
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [session.user.id]
    );
    return NextResponse.json({ bookings: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
