import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const userId = session.user.id;
  if (!id)
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT b.*, l.title as listing_title, l.city, l.type, l.address, l.price_sqm, l.images
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE b.id = $1 AND (b.user_id = $2 OR l.user_id = $2)`,
      [id, userId]
    );
    if (!rows.length)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ booking: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
