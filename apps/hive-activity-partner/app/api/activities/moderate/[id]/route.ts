// POST /api/activities/moderate/[id] — operator-only. Approve/reject a
// pending activity request. Approved → is_active=true, is_pending_moderation=false.
// Rejected → is_active=false, is_pending_moderation=false (kept for audit;
// operator can re-list later if appealed). Every decision writes both
// hap_moderation_log and hap_operator_audit.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireOperator, newRequestId } from "@/lib/operator-auth";
import { auditOperatorAction } from "@/lib/db-operator";
import { isUuid } from "@/lib/validation/activity";

export const dynamic = "force-dynamic";

const DECISIONS = ["approved", "rejected"] as const;
type Decision = (typeof DECISIONS)[number];

type Body = {
  decision: Decision;
  reason?: string | null;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let op;
  try {
    op = await requireOperator(req);
  } catch {
    return bad("OPERATOR_REQUIRED", 401);
  }

  const { id } = await ctx.params;
  if (!isUuid(id)) return bad("invalid id", 400);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("invalid JSON", 400);
  }

  if (!DECISIONS.includes(body.decision)) {
    return bad(`decision must be one of: ${DECISIONS.join(", ")}`, 400);
  }
  const reason = body.reason ? String(body.reason).trim().slice(0, 500) : null;
  if (body.decision === "rejected" && (!reason || reason.length === 0)) {
    return bad("rejection requires a reason", 400);
  }

  const target = (await sql`
    SELECT id, is_pending_moderation FROM hap_activity_taxonomy WHERE id = ${id} LIMIT 1
  `) as Array<{ id: string; is_pending_moderation: boolean }>;
  if (target.length === 0) return bad("not found", 404);
  if (!target[0].is_pending_moderation) {
    return bad("already moderated", 409);
  }

  const requestId = newRequestId();
  if (body.decision === "approved") {
    await sql`
      UPDATE hap_activity_taxonomy
      SET is_active = true, is_pending_moderation = false
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE hap_activity_taxonomy
      SET is_active = false, is_pending_moderation = false
      WHERE id = ${id}
    `;
  }

  await sql`
    INSERT INTO hap_moderation_log (taxonomy_id, decision, reason, moderator_identity, request_id)
    VALUES (${id}, ${body.decision}, ${reason}, ${op.identity}, ${requestId})
  `;

  await auditOperatorAction({
    identity: op,
    action: `activities.moderate.${body.decision}`,
    targetId: id,
    targetType: "hap_activity_taxonomy",
    requestId,
    metadata: reason ? { reason } : null,
  });

  return NextResponse.json({ id, decision: body.decision });
}
