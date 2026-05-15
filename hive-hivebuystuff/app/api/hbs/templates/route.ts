import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { TIER_LIMITS } from "@/app/api/hbs/usage/route";

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const rows = await sql`
    SELECT id, user_id, name, items, cadence, created_at, updated_at
    FROM hbs_templates
    WHERE user_id = ${user_id}
    ORDER BY updated_at DESC
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.user_id || !body.name || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "user_id, name, and items are required" }, { status: 400 });
  }

  const { user_id, name, items, cadence } = body;

  const [subRows, listRows] = await Promise.all([
    sql`SELECT tier FROM hbs_subscriptions WHERE user_id = ${user_id}`,
    sql`SELECT COUNT(*)::int AS count FROM hbs_templates WHERE user_id = ${user_id}`,
  ]);

  const tier = (subRows[0]?.tier ?? "free") as keyof typeof TIER_LIMITS;
  const list_count = listRows[0]?.count ?? 0;
  const limit = TIER_LIMITS[tier].lists;

  const isUpdate = await sql`SELECT id FROM hbs_templates WHERE user_id = ${user_id} AND name = ${name}`;
  if (isUpdate.length === 0 && list_count >= limit) {
    return NextResponse.json(
      { error: "List limit reached", tier, list_count, limit, upgrade_required: true },
      { status: 429 }
    );
  }

  const rows = await sql`
    INSERT INTO hbs_templates (user_id, name, items, cadence)
    VALUES (${user_id}, ${name}, ${JSON.stringify(items)}, ${cadence ?? null})
    ON CONFLICT (user_id, name) DO UPDATE SET
      items = EXCLUDED.items,
      cadence = EXCLUDED.cadence,
      updated_at = NOW()
    RETURNING id, user_id, name, items, cadence, created_at, updated_at
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
