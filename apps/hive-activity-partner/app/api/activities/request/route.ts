// POST /api/activities/request — user-requested new activity. Lands in
// hap_activity_taxonomy with is_active=false, is_pending_moderation=true,
// requested_by_user_id=<user>. Operator approves/rejects via /api/activities/moderate.
//
// Rate-limited to 1 request per user per 7 days to deter spam — checked
// against requested_by_user_id + created_at.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireHapUser } from "@/lib/auth";
import { validateActivityRequest } from "@/lib/validation/activity";

export const dynamic = "force-dynamic";

const RATE_LIMIT_DAYS = 7;

function badRequest(errors: { field: string; message: string }[]) {
  return NextResponse.json({ error: "VALIDATION_FAILED", errors }, { status: 400 });
}

function fromError(e: unknown): NextResponse | null {
  const status = (e as { status?: number })?.status;
  if (status === 401) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (status === 403) return NextResponse.json({ error: "SUSPENDED" }, { status: 403 });
  if (status === 404) return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 404 });
  return null;
}

export async function POST(req: Request) {
  let me;
  try {
    me = await requireHapUser();
  } catch (e) {
    const r = fromError(e);
    if (r) return r;
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest([{ field: "body", message: "invalid JSON" }]);
  }

  const result = validateActivityRequest(body);
  if (!result.ok) return badRequest(result.errors);
  const { slug, displayName, category, justification } = result.value;

  // Rate-limit: 1 request per RATE_LIMIT_DAYS per user.
  const cutoffIso = new Date(
    Date.now() - RATE_LIMIT_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const recent = (await sql`
    SELECT id FROM hap_activity_taxonomy
    WHERE requested_by_user_id = ${me.id}
      AND created_at > ${cutoffIso}::timestamptz
    LIMIT 1
  `) as Array<{ id: string }>;
  if (recent.length > 0) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retryAfterDays: RATE_LIMIT_DAYS },
      { status: 429 },
    );
  }

  // Slug clash with an existing active row → reject with 409 so the user
  // knows the activity already exists.
  const clash = (await sql`
    SELECT id, is_active FROM hap_activity_taxonomy WHERE slug = ${slug} LIMIT 1
  `) as Array<{ id: string; is_active: boolean }>;
  if (clash.length > 0) {
    return NextResponse.json(
      { error: "SLUG_TAKEN", existingId: clash[0].id, existingActive: clash[0].is_active },
      { status: 409 },
    );
  }

  const inserted = (await sql`
    INSERT INTO hap_activity_taxonomy (slug, display_name, category, is_active, is_pending_moderation, requested_by_user_id)
    VALUES (${slug}, ${displayName}, ${category}, false, true, ${me.id})
    RETURNING id
  `) as Array<{ id: string }>;

  // Justification is captured into hap_moderation_log up front so moderators
  // see the original ask without needing to query hap_users for the requester.
  await sql`
    INSERT INTO hap_moderation_log (taxonomy_id, decision, reason, moderator_identity)
    VALUES (${inserted[0].id}, 'archived', ${"REQUEST: " + justification}, ${"user:" + me.id})
  `;

  return NextResponse.json({ id: inserted[0].id, status: "pending_review" }, { status: 201 });
}
