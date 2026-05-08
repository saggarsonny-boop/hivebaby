// GET /api/health — minimal liveness probe.
//
// Returns 200 when the Next.js runtime is up. The aesthetic analysis
// pipeline (Anthropic) is not exercised here — that would burn API budget
// on every health-check invocation. Cron health-check workflow at
// .github/workflows/health-check.yml hits this path every 6h.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "HiveAestheticBestie",
    ts: new Date().toISOString(),
  });
}
