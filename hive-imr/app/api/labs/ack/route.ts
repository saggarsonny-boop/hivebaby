import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  patientId?: string;
  labId?: string;
  acknowledgedBy?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { patientId, labId, acknowledgedBy } = body;
  if (!labId || !acknowledgedBy) {
    return NextResponse.json(
      { error: "Missing required fields: labId, acknowledgedBy" },
      { status: 400 },
    );
  }

  const rows = await sql`
    INSERT INTO hive_imr.lab_acknowledgements
      (patient_id, lab_id, acknowledged_by)
    VALUES
      (${patientId ?? null}, ${labId}, ${acknowledgedBy})
    RETURNING id, acknowledged_at
  `;
  return NextResponse.json({ acknowledgement: rows[0] }, { status: 201 });
}
