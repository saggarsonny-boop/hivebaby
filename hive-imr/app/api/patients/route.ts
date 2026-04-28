import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`
    SELECT data
    FROM hive_imr.patients
    ORDER BY id
  `;
  const patients = rows.map((r: { data: unknown }) => r.data);
  return NextResponse.json({ patients });
}
