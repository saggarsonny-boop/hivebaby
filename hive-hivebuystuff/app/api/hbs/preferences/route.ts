import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const rows = await sql`
    SELECT * FROM hbs_preferences WHERE user_id = ${user_id}
  `;

  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const {
    user_id,
    budget_ceiling = null,
    substitution_tolerance = "flexible",
    preferred_backends = [],
    dietary_rules = [],
    delivery_constraints = {},
  } = body;

  const rows = await sql`
    INSERT INTO hbs_preferences (
      user_id, budget_ceiling, substitution_tolerance,
      preferred_backends, dietary_rules, delivery_constraints
    )
    VALUES (
      ${user_id},
      ${budget_ceiling},
      ${substitution_tolerance},
      ${JSON.stringify(preferred_backends)},
      ${JSON.stringify(dietary_rules)},
      ${JSON.stringify(delivery_constraints)}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      budget_ceiling = EXCLUDED.budget_ceiling,
      substitution_tolerance = EXCLUDED.substitution_tolerance,
      preferred_backends = EXCLUDED.preferred_backends,
      dietary_rules = EXCLUDED.dietary_rules,
      delivery_constraints = EXCLUDED.delivery_constraints,
      updated_at = NOW()
    RETURNING *
  `;

  return NextResponse.json(rows[0]);
}
