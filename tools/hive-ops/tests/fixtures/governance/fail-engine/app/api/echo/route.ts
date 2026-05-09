// Test fixture for HiveOps GOVERNANCE rules — every G-rule should FAIL
// (in WARN-only mode, that means every rule reports `warn`).
//
// This route handler does NOT import @queen-bee/client and does NOT
// call govern(). It also has no DB schema, no queen_bee_schemas in
// ENGINE_GRAMMAR.md frontmatter, and the engine slug is not in QB's
// registry.

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ echo: body.input });
}
