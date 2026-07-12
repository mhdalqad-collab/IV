import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VALID_TYPES, SORT_MAP } from "@/lib/constants";

// GET /api/listings — search with filters + pagination
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const city = sp.get("city");
  const type = sp.get("type");
  const min_price = sp.get("min_price");
  const max_price = sp.get("max_price");
  const min_size = sp.get("min_size");
  const max_size = sp.get("max_size");
  const min_slots = sp.get("min_slots");
  const amenities = sp.get("amenities");
  const sort = sp.get("sort");
  const page = sp.get("page") || "1";
  const limit = sp.get("limit") || "20";

  const conditions: string[] = ["is_active = true"];
  const params: unknown[] = [];
  let idx = 1;

  if (city) {
    conditions.push(`city ILIKE $${idx}`);
    params.push(`%${city}%`);
    idx++;
  }
  if (type && (VALID_TYPES as readonly string[]).includes(type)) {
    conditions.push(`type = $${idx}`);
    params.push(type);
    idx++;
  }
  if (min_price) {
    conditions.push(`price_sqm >= $${idx}`);
    params.push(Number(min_price));
    idx++;
  }
  if (max_price) {
    conditions.push(`price_sqm <= $${idx}`);
    params.push(Number(max_price));
    idx++;
  }
  if (min_size) {
    conditions.push(`size_sqm >= $${idx}`);
    params.push(Number(min_size));
    idx++;
  }
  if (max_size) {
    conditions.push(`size_sqm <= $${idx}`);
    params.push(Number(max_size));
    idx++;
  }
  if (min_slots) {
    conditions.push(`slots >= $${idx}`);
    params.push(Number(min_slots));
    idx++;
  }
  if (amenities) {
    const arr = amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) {
      conditions.push(`amenities @> $${idx}`);
      params.push(arr);
      idx++;
    }
  }

  const where = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";
  const order = SORT_MAP[sort || ""] || "created_at DESC";
  const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const pg = Math.max(parseInt(page) || 1, 1);
  const offset = (pg - 1) * lim;

  try {
    const countQ = await pool.query(
      `SELECT count(*) FROM listings ${where}`,
      params
    );
    const total = parseInt(countQ.rows[0].count);

    const dataQ = await pool.query(
      `SELECT id, user_id, title, description, type, city, country, address, lat, lng,
              size_sqm, slots, price_sqm, currency, amenities, images, videos, rating, review_count,
              free_cancel, insurance, created_at
       FROM listings ${where}
       ORDER BY ${order}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, lim, offset]
    );

    return NextResponse.json({
      listings: dataQ.rows,
      total,
      page: pg,
      pages: Math.ceil(total / lim),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/listings — create listing
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await request.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const {
    title,
    description,
    type,
    city,
    country,
    address,
    lat,
    lng,
    size_sqm,
    slots,
    price_sqm,
    currency,
    amenities,
    images,
    videos,
    free_cancel,
    insurance,
  } = body;

  if (!title || typeof title !== "string" || title.length > 200)
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  if (!(VALID_TYPES as readonly string[]).includes(type))
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  if (!city)
    return NextResponse.json({ error: "invalid_city" }, { status: 400 });
  if (!size_sqm || size_sqm <= 0)
    return NextResponse.json({ error: "invalid_size" }, { status: 400 });
  if (!price_sqm || price_sqm <= 0)
    return NextResponse.json({ error: "invalid_price" }, { status: 400 });

  const slotsVal =
    slots == null || slots === ""
      ? 1
      : Number.isInteger(Number(slots)) && Number(slots) >= 1
      ? Number(slots)
      : null;
  if (slotsVal === null)
    return NextResponse.json({ error: "invalid_slots" }, { status: 400 });

  const latVal = lat == null || lat === "" ? null : Number(lat);
  const lngVal = lng == null || lng === "" ? null : Number(lng);
  if (
    (latVal !== null && !(latVal >= -90 && latVal <= 90)) ||
    (lngVal !== null && !(lngVal >= -180 && lngVal <= 180)) ||
    (latVal === null) !== (lngVal === null)
  )
    return NextResponse.json({ error: "invalid_location" }, { status: 400 });

  try {
    const { rows } = await pool.query(
      `INSERT INTO listings (user_id, title, description, type, city, country, address, lat, lng, size_sqm, slots, price_sqm, currency, amenities, images, videos, free_cancel, insurance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [
        userId,
        title,
        description || "",
        type,
        city,
        country || "OM",
        address || "",
        latVal,
        lngVal,
        size_sqm,
        slotsVal,
        price_sqm,
        currency || "OMR",
        amenities || [],
        images || [],
        videos || [],
        free_cancel || false,
        insurance || false,
      ]
    );
    return NextResponse.json({ listing: rows[0] }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
