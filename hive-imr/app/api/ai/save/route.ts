import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  patientId?: string | null;
  role?: string;
  promptType?: string;
  prompt?: string;
  output?: string;
  edited?: string | null;
  signed?: boolean;
  signedBy?: string | null;
  signedAt?: string | null;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { patientId, role, promptType, prompt, output, edited, signed, signedBy, signedAt } = body;
  if (!role || !promptType || !prompt || !output) {
    return NextResponse.json(
      { error: "Missing required fields: role, promptType, prompt, output" },
      { status: 400 },
    );
  }

  const rows = await sql`
    INSERT INTO hive_imr.ai_generations
      (patient_id, role, prompt_type, prompt, output, edited, signed, signed_by, signed_at)
    VALUES
      (
        ${patientId ?? null},
        ${role},
        ${promptType},
        ${prompt},
        ${output},
        ${edited ?? null},
        ${signed ?? false},
        ${signedBy ?? null},
        ${signedAt ?? null}
      )
    RETURNING id, created_at, signed, audit_logged
  `;
  return NextResponse.json({ generation: rows[0] }, { status: 201 });
}
