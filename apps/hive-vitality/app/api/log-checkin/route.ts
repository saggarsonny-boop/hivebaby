// POST /api/log-checkin — record a weekly mood rating (1-5). Attaches
// to the most-recent session row; v0.2 will introduce a dedicated
// hv_checkins table when the weekly question set grows beyond the
// single Likert.

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
  let body: { moodRating?: unknown; ritualDate?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const moodRating =
    typeof body.moodRating === "number" && body.moodRating >= 1 && body.moodRating <= 5
      ? Math.round(body.moodRating)
      : null;

  if (moodRating === null) {
    return NextResponse.json({ error: "moodRating must be 1-5" }, { status: 400 });
  }

  const ritualDate =
    typeof body.ritualDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.ritualDate)
      ? body.ritualDate
      : new Date().toISOString().slice(0, 10);

  try {
    const sql = getDb();
    const clerkId = syntheticClerkId(req);
    await sql`
      UPDATE hv_sessions s
      SET mood_rating = ${moodRating}
      FROM hv_users u
      WHERE s.user_id = u.id
        AND u.clerk_user_id = ${clerkId}
        AND s.ritual_date = ${ritualDate}
    `;
  } catch {
    return NextResponse.json({ ok: true, sync: "deferred" });
  }

  return NextResponse.json({ ok: true });
}
