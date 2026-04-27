import { NextResponse } from "next/server";
import { runMigration } from "@/lib/migrate";

export async function POST() {
  try {
    await runMigration();
    return NextResponse.json({ status: "ok", message: "Migration complete" });
  } catch (err) {
    console.error("[migrate]", err);
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }
}
