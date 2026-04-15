import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT l.*,
              (SELECT count(*) FROM bookings b WHERE b.listing_id = l.id AND b.status != 'cancelled') as booking_count
       FROM listings l WHERE l.user_id = $1 ORDER BY l.created_at DESC`,
      [session.user.id]
    );
    return NextResponse.json({ listings: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
