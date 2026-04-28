import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rows = await sql`
    SELECT data
    FROM hive_imr.patients
    WHERE id = ${id}
    LIMIT 1
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  return NextResponse.json({ patient: rows[0].data });
}
