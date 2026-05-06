// Engine health check. Returns 200 with engine identity + a quick DB
// liveness probe. Used by the HiveOps audit (V19 launch_checklist health_check)
// and any external monitor.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    const rows = (await sql`SELECT 1 AS ok`) as Array<{ ok: number }>;
    dbOk = rows[0]?.ok === 1;
  } catch {
    dbOk = false;
  }

  return NextResponse.json(
    {
      engine: "hive-activity-partner",
      version: "0.1.0",
      ok: dbOk,
      timestamp: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 },
  );
}
