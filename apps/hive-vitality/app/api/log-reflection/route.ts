// POST /api/log-reflection — append a 10-second daily reflection text
// to the user's most-recent ritual session. No QB call; reflection text
// is already covered by the parent vitality-session-log envelope when
// the session is logged with reflectionText present.

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function syntheticClerkId(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const ua = req.headers.get("user-agent") || "anon";
  return "anon_" + createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  let body: { text?: unknown; ritualDate?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.slice(0, 1000) : "";
  const ritualDate =
    typeof body.ritualDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.ritualDate)
      ? body.ritualDate
      : new Date().toISOString().slice(0, 10);

  if (!text.trim()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const sql = getDb();
    const clerkId = syntheticClerkId(req);
    await sql`
      UPDATE hv_sessions s
      SET reflection_text = ${text}
      FROM hv_users u
      WHERE s.user_id = u.id
        AND u.clerk_user_id = ${clerkId}
        AND s.ritual_date = ${ritualDate}
    `;
  } catch {
    // Best-effort — never fail the user on a 10-second note.
    return NextResponse.json({ ok: true, sync: "deferred" });
  }

  return NextResponse.json({ ok: true });
}
