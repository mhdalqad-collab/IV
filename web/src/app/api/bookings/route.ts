import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { bookingTotal } from "@/lib/bookingMath";

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
  const sizeNum = Number(size_sqm);
  if (!Number.isFinite(sizeNum) || sizeNum <= 0)
    return NextResponse.json({ error: "invalid_size" }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Lock the listing row so concurrent bookings/confirms for the same
    // listing serialize against the capacity check below.
    const listing = await client.query(
      "SELECT id, price_sqm, size_sqm, user_id, is_active FROM listings WHERE id = $1 FOR UPDATE",
      [listing_id]
    );
    if (!listing.rows.length || !listing.rows[0].is_active) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "listing_not_found" }, { status: 404 });
    }
    if (String(listing.rows[0].user_id) === userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "cannot_book_own" }, { status: 400 });
    }

    const priced = bookingTotal(
      Number(listing.rows[0].price_sqm),
      sizeNum,
      start_date,
      end_date
    );
    if (!priced) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "invalid_dates" }, { status: 400 });
    }

    const listingSize = Number(listing.rows[0].size_sqm);
    if (sizeNum > listingSize) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "size_exceeds_listing", max: listingSize },
        { status: 400 }
      );
    }

    // Area already committed to confirmed bookings overlapping these dates
    // (dates are inclusive on both ends). Pending requests don't reserve
    // capacity — the final gate is the capacity re-check at confirm time.
    const cap = await client.query(
      `SELECT COALESCE(SUM(size_sqm), 0) AS committed
         FROM bookings
        WHERE listing_id = $1 AND status = 'confirmed'
          AND start_date <= $3 AND end_date >= $2`,
      [listing_id, start_date, end_date]
    );
    const available = listingSize - Number(cap.rows[0].committed);
    if (sizeNum > available) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "insufficient_capacity", available: Math.max(0, available) },
        { status: 409 }
      );
    }

    const { rows } = await client.query(
      `INSERT INTO bookings (listing_id, user_id, start_date, end_date, size_sqm, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        listing_id,
        userId,
        start_date,
        end_date,
        sizeNum,
        priced.total.toFixed(3),
        notes || "",
      ]
    );
    await client.query("COMMIT");
    return NextResponse.json({ booking: rows[0] }, { status: 201 });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  } finally {
    client.release();
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
