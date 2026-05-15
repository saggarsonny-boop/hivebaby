import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const user_id = body?.user_id;

  if (!user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const result = await sql`
    DELETE FROM hbs_templates WHERE id = ${id} AND user_id = ${user_id}
    RETURNING id
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}
