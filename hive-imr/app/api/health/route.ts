import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    engine: "HiveIMR",
    domain: "hiveimr.hive.baby",
    phase: 1,
    time: new Date().toISOString(),
  });
}
