// Mixed-engine fixture: package installed (G01 PASS), but no govern() call
// (G02 FAIL), schema declared (G04 PASS), but stamp not persisted (G05 FAIL).
// G03 depends on the registry mock — the test sets it to PASS for this
// fixture so the mixed-engine winds up at 3/5 PASS.

export async function POST(req: Request) {
  const body = await req.json();
  // Engine still working "old way" — no govern() call yet.
  return Response.json({ echo: body.input });
}
