import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
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
      `SELECT b.*, l.user_id as owner_id FROM bookings b JOIN listings l ON l.id = b.listing_id WHERE b.id = $1`,
      [id]
    );
    if (!rows.length)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (String(rows[0].user_id) !== userId && String(rows[0].owner_id) !== userId)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    if (rows[0].status === "cancelled")
      return NextResponse.json(
        { error: "already_cancelled" },
        { status: 400 }
      );

    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    return NextResponse.json({ booking: result.rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
