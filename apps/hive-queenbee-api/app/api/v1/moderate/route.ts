import { NextResponse } from "next/server";
import { checkAndConsumeCredit } from "@/lib/credits";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization Header" }, { status: 401 });
  }

  const creditCheck = await checkAndConsumeCredit();
  if (!creditCheck.allowed) {
    return NextResponse.json({ error: "API limit reached. Please upgrade to Premium." }, { status: 402 });
  }

  try {
    const body = await req.json();
    if (!body.prompt) {
      return NextResponse.json({ error: "Missing 'prompt' in payload" }, { status: 400 });
    }

    const isToxic = body.prompt.toLowerCase().includes("kill") || body.prompt.toLowerCase().includes("hack");
    const isPhi = body.prompt.match(/\d{3}-\d{2}-\d{4}/);

    if (isToxic) {
      return NextResponse.json({ safe: false, toxicity_score: 0.95, flags: ["Violence/Toxicity"], reason: "Toxic language detected." });
    }
    if (isPhi) {
      return NextResponse.json({ safe: false, toxicity_score: 0.1, flags: ["PHI/PII"], reason: "Sensitive personal information detected." });
    }

    return NextResponse.json({ safe: true, toxicity_score: 0.01, flags: [] });

  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON Payload" }, { status: 400 });
  }
}
