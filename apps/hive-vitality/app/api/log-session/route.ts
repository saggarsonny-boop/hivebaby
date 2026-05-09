// POST /api/log-session — accept a completed (or partial) ritual log,
// validate it, route through Queen Bee for governance stamping, persist
// to Neon. This is the canonical Queen Bee consumption call site for
// HiveVitality and the reference implementation other engines copy from
// (see WIRING_QUEEN_BEE.md at the engine root).
//
// Auth: v0.1 ships open (no Clerk). Anonymous demo flow logs anonymously
// keyed by a synthetic clerk_user_id derived from the request IP+UA hash;
// Phase 2 wires real Clerk and replaces the synth key.

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { govern, QueenBeeUnavailableError } from "@/lib/queen-bee-client";
import { getDb } from "@/lib/db";
import { ALL_COMPONENT_SLUGS } from "@/lib/ritual";
import type { ComponentSlug, SessionPayload } from "@/types/vitality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Anonymous demo identity. Stable per browser-session via UA + IP hash;
// gets replaced with a Clerk user id once Phase 2 lands.
function syntheticClerkId(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const ua = req.headers.get("user-agent") || "anon";
  return "anon_" + createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

function isValidSlug(s: unknown): s is ComponentSlug {
  return typeof s === "string" && (ALL_COMPONENT_SLUGS as string[]).includes(s);
}

function parsePayload(body: unknown): SessionPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.ritualDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.ritualDate)) return null;
  if (typeof b.durationSeconds !== "number" || b.durationSeconds < 0) return null;
  if (typeof b.currentWeek !== "number" || b.currentWeek < 1 || b.currentWeek > 10) return null;
  if (!Array.isArray(b.completedComponents)) return null;
  const completedComponents = b.completedComponents.filter(isValidSlug);
  return {
    ritualDate: b.ritualDate,
    durationSeconds: Math.round(b.durationSeconds),
    currentWeek: Math.round(b.currentWeek),
    completedComponents,
    reflectionText: typeof b.reflectionText === "string" ? b.reflectionText.slice(0, 1000) : undefined,
    moodRating:
      typeof b.moodRating === "number" && b.moodRating >= 1 && b.moodRating <= 5
        ? (Math.round(b.moodRating) as 1 | 2 | 3 | 4 | 5)
        : undefined,
  };
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = parsePayload(raw);
  if (!payload) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const clerkId = syntheticClerkId(req);

  // ── Step 1: Queen Bee governance ───────────────────────────────────
  // The schema 'vitality-session-log' (registered in queen-bee/lib/schemas.ts
  // as of QB PR #7) requires userId, ritualDate, durationSeconds,
  // currentWeek, completedComponents. The govern() call returns a Result-
  // shape verdict; on transport failure we fall through to a local-only
  // persist (fail-OPEN) and surface the gap as a flag in the response so
  // the client can show "synced locally — will retry" copy.
  const govContent = {
    userId: clerkId,
    ritualDate: payload.ritualDate,
    durationSeconds: payload.durationSeconds,
    currentWeek: payload.currentWeek,
    completedComponents: payload.completedComponents,
    reflectionText: payload.reflectionText,
    moodRating: payload.moodRating,
  };

  let stamp: Record<string, unknown> | null = null;
  let qbStatus: "approved" | "rejected" | "unavailable" = "approved";
  let qbDetail: string | undefined;

  try {
    const verdict = await govern({
      engineId: "hivevitality",
      input: payload.reflectionText ?? "",
      content: govContent,
      context: { tier: "free", sessionId: clerkId },
    });
    if (verdict.approved && verdict.governanceStamp) {
      stamp = verdict.governanceStamp as unknown as Record<string, unknown>;
    } else if (!verdict.approved) {
      qbStatus = "rejected";
      qbDetail = verdict.failureReason;
      // Reject path: stop here — don't persist a session QB refused. The
      // engine surfaces the failureReason so the client can show the user
      // what to fix.
      return NextResponse.json(
        { error: "qb_rejected", detail: qbDetail, schemaErrors: verdict.schemaErrors },
        { status: 422 },
      );
    }
  } catch (err) {
    if (err instanceof QueenBeeUnavailableError) {
      qbStatus = "unavailable";
      qbDetail = err.message;
      // Fail-OPEN — log without a stamp, mark unstamped so a future sweep
      // can backfill. Better to preserve the streak than to fail the user
      // when QB is briefly unreachable.
    } else {
      throw err;
    }
  }

  // ── Step 2: persist to Neon ────────────────────────────────────────
  try {
    const sql = getDb();
    // Upsert the user (synthetic-id keyed). Real Clerk wiring lands in Phase 2.
    const userRows = (await sql`
      INSERT INTO hv_users (clerk_user_id, current_week)
      VALUES (${clerkId}, ${payload.currentWeek})
      ON CONFLICT (clerk_user_id) DO UPDATE
        SET current_week = EXCLUDED.current_week,
            updated_at = NOW()
      RETURNING id, current_week, streak_count, ritual_count
    `) as Array<{ id: number; current_week: number; streak_count: number; ritual_count: number }>;
    const user = userRows[0];

    await sql`
      INSERT INTO hv_sessions (
        user_id, ritual_date, duration_seconds, completed_components,
        reflection_text, mood_rating, governance_stamp
      ) VALUES (
        ${user.id}, ${payload.ritualDate}, ${payload.durationSeconds},
        ${JSON.stringify(payload.completedComponents)}::jsonb,
        ${payload.reflectionText ?? null}, ${payload.moodRating ?? null},
        ${stamp ? JSON.stringify(stamp) : null}::jsonb
      )
      ON CONFLICT (user_id, ritual_date) DO UPDATE
        SET duration_seconds = EXCLUDED.duration_seconds,
            completed_components = EXCLUDED.completed_components,
            reflection_text = EXCLUDED.reflection_text,
            mood_rating = EXCLUDED.mood_rating,
            governance_stamp = EXCLUDED.governance_stamp
    `;

    // Bump ritual_count + recompute streak inline (best-effort).
    await sql`
      UPDATE hv_users
      SET ritual_count = ritual_count + 1,
          updated_at = NOW()
      WHERE id = ${user.id}
    `;
  } catch (err) {
    return NextResponse.json(
      { error: "db_unavailable", detail: err instanceof Error ? err.message : "unknown" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    qb: { status: qbStatus, detail: qbDetail, stamp },
  });
}
