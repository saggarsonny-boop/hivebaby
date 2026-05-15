import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export const TIER_LIMITS = {
  free: { lists: 3, runs_per_month: 10 },
  pro: { lists: Infinity, runs_per_month: 100 },
  premium: { lists: Infinity, runs_per_month: Infinity },
};

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const ym = currentYearMonth();

  const [subRows, usageRows, listRows] = await Promise.all([
    sql`SELECT tier, stripe_customer_id, current_period_end FROM hbs_subscriptions WHERE user_id = ${user_id}`,
    sql`SELECT run_count FROM hbs_usage WHERE user_id = ${user_id} AND year_month = ${ym}`,
    sql`SELECT COUNT(*)::int AS count FROM hbs_templates WHERE user_id = ${user_id}`,
  ]);

  const tier = (subRows[0]?.tier ?? "free") as keyof typeof TIER_LIMITS;
  const run_count = usageRows[0]?.run_count ?? 0;
  const list_count = listRows[0]?.count ?? 0;
  const limits = TIER_LIMITS[tier];

  return NextResponse.json({
    tier,
    year_month: ym,
    run_count,
    list_count,
    limits: {
      lists: limits.lists === Infinity ? null : limits.lists,
      runs_per_month: limits.runs_per_month === Infinity ? null : limits.runs_per_month,
    },
    stripe_customer_id: subRows[0]?.stripe_customer_id ?? null,
    current_period_end: subRows[0]?.current_period_end ?? null,
  });
}
