import { govern } from "@queen-bee/client";

export async function POST(req: Request) {
  const body = await req.json();
  const verdict = await govern({
    engineId: "pass-engine",
    input: body.input ?? "",
    content: { display: body.input },
  });
  if (!verdict.approved) {
    return Response.json({ error: verdict.failureReason }, { status: 422 });
  }
  return Response.json({
    ...verdict.stampedContent,
    _governance: verdict.governanceStamp,
  });
}
