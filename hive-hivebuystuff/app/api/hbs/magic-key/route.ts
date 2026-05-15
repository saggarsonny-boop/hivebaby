import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import sql from "@/lib/db";

function hashKey(raw: string): string {
  const secret = process.env.CRON_SECRET ?? "hive-hbs-fallback-secret";
  return createHmac("sha256", secret).update(raw.toLowerCase().trim()).digest("hex");
}

// GET /api/hbs/magic-key?key=xxx — look up user_id by key
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("key");
  if (!raw || raw.length < 8) {
    return NextResponse.json({ error: "key must be at least 8 characters" }, { status: 400 });
  }
  const hash = hashKey(raw);
  const rows = await sql`SELECT user_id FROM hbs_magic_keys WHERE key_hash = ${hash}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }
  return NextResponse.json({ user_id: rows[0].user_id });
}

// POST /api/hbs/magic-key — register or update a key for a user_id
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { user_id, key } = body ?? {};

  if (!user_id || !key || key.length < 8) {
    return NextResponse.json(
      { error: "user_id and key (8+ chars) are required" },
      { status: 400 }
    );
  }

  const hash = hashKey(key);

  // Check if this hash is already claimed by a different user
  const existing = await sql`SELECT user_id FROM hbs_magic_keys WHERE key_hash = ${hash}`;
  if (existing.length > 0 && existing[0].user_id !== user_id) {
    return NextResponse.json(
      { error: "This key is already taken. Choose a different one." },
      { status: 409 }
    );
  }

  await sql`
    INSERT INTO hbs_magic_keys (key_hash, user_id)
    VALUES (${hash}, ${user_id})
    ON CONFLICT (key_hash) DO UPDATE SET user_id = EXCLUDED.user_id
  `;

  return NextResponse.json({ status: "ok" });
}
