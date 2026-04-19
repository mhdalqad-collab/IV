import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (!id)
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.email as reviewer
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.listing_id = $1 ORDER BY r.created_at DESC`,
      [id]
    );
    return NextResponse.json({ reviews: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
