import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "HivePlainScan",
    timestamp: new Date().toISOString(),
  });
}
