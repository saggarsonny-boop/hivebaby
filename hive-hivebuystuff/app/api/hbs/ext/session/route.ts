import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// POST — web app creates a pending extension session
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { user_id, items, backend } = body ?? {};

  if (!user_id || !Array.isArray(items) || !backend) {
    return NextResponse.json({ error: "user_id, items, and backend required" }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO hbs_ext_sessions (user_id, items, backend)
    VALUES (${user_id}, ${JSON.stringify(items)}, ${backend})
    RETURNING id, status, expires_at
  `;

  return NextResponse.json(rows[0], { status: 201 });
}

// GET — extension polls for pending sessions
export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  const session_id = req.nextUrl.searchParams.get("session_id");

  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  if (session_id) {
    const rows = await sql`
      SELECT * FROM hbs_ext_sessions
      WHERE id = ${session_id} AND user_id = ${user_id} AND expires_at > NOW()
    `;
    return NextResponse.json(rows[0] ?? null);
  }

  const rows = await sql`
    SELECT id, backend, items, status, created_at, expires_at
    FROM hbs_ext_sessions
    WHERE user_id = ${user_id} AND status = 'pending' AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 5
  `;
  return NextResponse.json(rows);
}

// PATCH — extension updates session status/result
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { session_id, user_id, status, result } = body ?? {};

  if (!session_id || !user_id || !status) {
    return NextResponse.json({ error: "session_id, user_id, status required" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE hbs_ext_sessions
    SET status = ${status}, result = ${result ? JSON.stringify(result) : null}
    WHERE id = ${session_id} AND user_id = ${user_id}
    RETURNING id, status
  `;

  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
