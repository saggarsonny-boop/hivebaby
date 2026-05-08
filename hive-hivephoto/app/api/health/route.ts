// GET /api/health — minimal liveness probe.
//
// Returns 200 when the Next.js runtime is up. The R2 / Neon / Anthropic /
// Stripe surfaces are not exercised here — health endpoints that probe
// downstream services tend to cause more outages than they detect. Cron
// health-check workflow at .github/workflows/health-check.yml hits this
// path every 6h.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "HivePhoto",
    ts: new Date().toISOString(),
  });
}
