import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT
         to_char(b.created_at, 'YYYY-MM') as month,
         count(*) as bookings,
         SUM(b.total_price) as revenue
       FROM bookings b JOIN listings l ON l.id = b.listing_id
       WHERE l.user_id = $1 AND b.status IN ('confirmed','completed')
       GROUP BY to_char(b.created_at, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 12`,
      [session.user.id]
    );
    return NextResponse.json({ earnings: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
