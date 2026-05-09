// /api/health — canonical Hive shape: { engine, version, ok, features }.
// Consumed by HiveOps live-health probe (V29) and Queen Bee /api/audit
// reachability check.

import { NextResponse } from "next/server";
import { isReady } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION = "0.1.0";

export async function GET() {
  return NextResponse.json({
    engine: "HiveVitality",
    version: VERSION,
    ok: true,
    timestamp: new Date().toISOString(),
    features: {
      database: await isReady(),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      queen_bee_url: process.env.QUEEN_BEE_URL || "https://queenbee.hive.baby",
    },
  });
}
