import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  patientId?: string;
  orderType?: string;
  orderData?: unknown;
  priority?: string;
  dx?: string | null;
  note?: string | null;
  submittedBy?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { patientId, orderType, orderData, priority, dx, note, submittedBy } = body;
  if (!orderType || !priority || !submittedBy || orderData === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: orderType, orderData, priority, submittedBy" },
      { status: 400 },
    );
  }

  const rows = await sql`
    INSERT INTO hive_imr.orders
      (patient_id, order_type, order_data, priority, dx, note, submitted_by)
    VALUES
      (${patientId ?? null}, ${orderType}, ${JSON.stringify(orderData)}, ${priority}, ${dx ?? null}, ${note ?? null}, ${submittedBy})
    RETURNING id, submitted_at, status
  `;
  return NextResponse.json({ order: rows[0] }, { status: 201 });
}
