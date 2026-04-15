import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, u.email as renter_email
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u ON u.id = b.user_id
       WHERE l.user_id = $1
       ORDER BY b.created_at DESC`,
      [session.user.id]
    );
    return NextResponse.json({ reservations: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
