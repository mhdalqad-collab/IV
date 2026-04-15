import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

const isEmail = (s: string) =>
  typeof s === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) &&
  s.length <= 254;
const isPassword = (s: string) =>
  typeof s === "string" && s.length >= 8 && s.length <= 128;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { email, password, commercial_register_number } = body || {};

  if (!isEmail(email))
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!isPassword(password))
    return NextResponse.json({ error: "password_min_8" }, { status: 400 });

  let crn: string | null = null;
  if (commercial_register_number != null && commercial_register_number !== "") {
    if (
      typeof commercial_register_number !== "string" ||
      commercial_register_number.trim().length === 0 ||
      commercial_register_number.trim().length > 64
    ) {
      return NextResponse.json({ error: "invalid_cr_number" }, { status: 400 });
    }
    crn = commercial_register_number.trim();
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password, commercial_register_number) VALUES ($1, $2, $3) RETURNING id, email, created_at",
      [email, hash, crn]
    );
    return NextResponse.json(
      { user: { id: rows[0].id, email: rows[0].email } },
      { status: 201 }
    );
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "23505")
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
