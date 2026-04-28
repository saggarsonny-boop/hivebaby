import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  patientId?: string;
  bp?: string | null;
  hr?: string | null;
  rr?: string | null;
  spo2?: string | null;
  temp?: string | null;
  painScore?: number | null;
  chartedBy?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { patientId, bp, hr, rr, spo2, temp, painScore, chartedBy } = body;
  if (!chartedBy) {
    return NextResponse.json({ error: "Missing required field: chartedBy" }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO hive_imr.vitals
      (patient_id, bp, hr, rr, spo2, temp, pain_score, charted_by)
    VALUES
      (
        ${patientId ?? null},
        ${bp ?? null},
        ${hr ?? null},
        ${rr ?? null},
        ${spo2 ?? null},
        ${temp ?? null},
        ${painScore ?? null},
        ${chartedBy}
      )
    RETURNING id, charted_at
  `;
  return NextResponse.json({ vitals: rows[0] }, { status: 201 });
}
