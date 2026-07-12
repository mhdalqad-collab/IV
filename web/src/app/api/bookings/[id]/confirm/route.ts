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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Lock booking + listing rows so concurrent confirms on the same listing
    // serialize against the capacity check.
    const { rows } = await client.query(
      `SELECT b.*, l.user_id AS owner_id, l.size_sqm AS listing_size
         FROM bookings b JOIN listings l ON l.id = b.listing_id
        WHERE b.id = $1
        FOR UPDATE OF b, l`,
      [id]
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (String(rows[0].owner_id) !== userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (rows[0].status !== "pending") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "not_pending" }, { status: 400 });
    }

    // The confirmed set must never oversell the listing's area: re-check
    // capacity against other confirmed bookings overlapping these dates.
    const cap = await client.query(
      `SELECT COALESCE(SUM(size_sqm), 0) AS committed
         FROM bookings
        WHERE listing_id = $1 AND status = 'confirmed' AND id <> $2
          AND start_date <= $4 AND end_date >= $3`,
      [rows[0].listing_id, id, rows[0].start_date, rows[0].end_date]
    );
    const available =
      Number(rows[0].listing_size) - Number(cap.rows[0].committed);
    if (Number(rows[0].size_sqm) > available) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "insufficient_capacity", available: Math.max(0, available) },
        { status: 409 }
      );
    }

    const result = await client.query(
      `UPDATE bookings SET status = 'confirmed', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    await client.query("COMMIT");
    return NextResponse.json({ booking: result.rows[0] });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  } finally {
    client.release();
  }
}
