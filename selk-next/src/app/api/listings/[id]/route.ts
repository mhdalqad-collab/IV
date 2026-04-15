import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VALID_TYPES } from "@/lib/constants";

// GET /api/listings/:id
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
      `SELECT l.*, u.email as owner_email
       FROM listings l JOIN users u ON u.id = l.user_id
       WHERE l.id = $1 AND l.is_active = true`,
      [id]
    );
    if (!rows.length)
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    const listing = rows[0];
    delete listing.password;
    return NextResponse.json({ listing });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PUT /api/listings/:id — update (owner only)
export async function PUT(
  request: NextRequest,
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

  const body = await request.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  try {
    const check = await pool.query(
      "SELECT user_id FROM listings WHERE id = $1",
      [id]
    );
    if (!check.rows.length)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (String(check.rows[0].user_id) !== userId)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const fields = [
      "title",
      "description",
      "type",
      "city",
      "country",
      "address",
      "lat",
      "lng",
      "size_sqm",
      "price_sqm",
      "currency",
      "amenities",
      "images",
      "free_cancel",
      "insurance",
    ];
    const updates: string[] = [];
    const sqlParams: unknown[] = [];
    let idx = 1;

    for (const f of fields) {
      if (body[f] !== undefined) {
        if (
          f === "type" &&
          !(VALID_TYPES as readonly string[]).includes(body[f])
        )
          return NextResponse.json(
            { error: "invalid_type" },
            { status: 400 }
          );
        updates.push(`${f} = $${idx}`);
        sqlParams.push(body[f]);
        idx++;
      }
    }
    if (!updates.length)
      return NextResponse.json({ error: "no_fields" }, { status: 400 });

    updates.push("updated_at = now()");
    sqlParams.push(id);

    const { rows } = await pool.query(
      `UPDATE listings SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      sqlParams
    );
    return NextResponse.json({ listing: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/listings/:id — soft delete (owner only)
export async function DELETE(
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
    const check = await pool.query(
      "SELECT user_id FROM listings WHERE id = $1",
      [id]
    );
    if (!check.rows.length)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (String(check.rows[0].user_id) !== userId)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await pool.query(
      "UPDATE listings SET is_active = false, updated_at = now() WHERE id = $1",
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
