# Wiring Queen Bee in HiveVitality — canonical reference

This is the canonical reference implementation for engines onboarding to Queen Bee runtime governance. It mirrors the structure of `packages/queen-bee-client/WIRING.md` in the queen-bee repo but is grounded in real call-site code, not a hypothetical engine.

## Status

- **Engine version:** HiveVitality v0.1
- **QB schema consumed:** `vitality-session-log` (defined in `queen-bee/lib/schemas.ts` as of QB PR #7)
- **Registry entry:** `hivevitality` in `queen-bee/lib/registry.ts` (status `planned` until this engine deploys to production)
- **Call site:** [`app/api/log-session/route.ts`](./app/api/log-session/route.ts) — single `govern()` invocation per ritual completion

## Why HiveVitality is the reference

When QB shipped (PR #1), the migration plan called for HiveSecretBox to be the first production consumer (per the queen-bee-client WIRING.md guide). HivePlainScan declared `planned_qb_consumption` but didn't wire `govern()` in v0.2. HiveVitality v0.1 ships the wiring on day-one, so subsequent engines (HivePlainScan revival, HiveAdminSupport, HiveAestheticBestie) can copy this layout.

## The five wiring moves

### 1. Vendored client at `lib/queen-bee-client/`

`@queen-bee/client` is not (yet) npm-published, so we vendor a snapshot per Constitution §V `[INLINE_PACKAGE]`. See `lib/queen-bee-client/README.md` for the sync pattern. Once the package is on npm, swap the vendored copy for the real dependency in one PR; the import path `@/lib/queen-bee-client` becomes `@queen-bee/client` and the directory is deleted.

### 2. ENGINE_GRAMMAR declares `queen_bee_schemas`

```yaml
queen_bee_schemas:
  - vitality-session-log
```

HiveOps G04 reads this and verifies the engine is calling `govern()` against a known schema. If the schema isn't in `queen-bee/lib/schemas.ts` (currently 17 entries) the engine PR is blocked until a precursor QB PR lands the schema definition.

### 3. Database schema persists `governance_stamp`

```sql
CREATE TABLE hv_sessions (
  -- … other columns
  governance_stamp JSONB
);
```

HiveOps G05 scans `migrations/` and `db/schema/` for the `governance_stamp` (or `governanceStamp` / `stamp_id` / `stampId`) column name. The stamp is the audit trail proving QB validated the payload. Engines without a database (client-only PWAs like ParkBack, HiveMoon) declare `engine_class: static-html` in `ENGINE_GRAMMAR.md` to be exempted.

### 4. The `govern()` call site

In `app/api/log-session/route.ts`:

```ts
import { govern, QueenBeeUnavailableError } from "@/lib/queen-bee-client";

// …

let stamp: Record<string, unknown> | null = null;
try {
  const verdict = await govern({
    engineId: "hivevitality",
    input: payload.reflectionText ?? "",
    content: {
      userId,
      ritualDate: payload.ritualDate,
      durationSeconds: payload.durationSeconds,
      currentWeek: payload.currentWeek,
      completedComponents: payload.completedComponents,
      // optional fields go in too, even though they're not required by
      // the schema — they end up in the audit trail.
      reflectionText: payload.reflectionText,
      moodRating: payload.moodRating,
    },
    context: { tier: "free", sessionId: userId },
  });

  if (verdict.approved && verdict.governanceStamp) {
    stamp = verdict.governanceStamp;
  } else if (!verdict.approved) {
    // Business rejection — surface failureReason to the user. The session
    // is NOT persisted; the client renders the failureReason so the user
    // can fix the input.
    return NextResponse.json(
      { error: "qb_rejected", detail: verdict.failureReason, schemaErrors: verdict.schemaErrors },
      { status: 422 },
    );
  }
} catch (err) {
  if (err instanceof QueenBeeUnavailableError) {
    // Transport failure — fail-OPEN. Persist without a stamp; a future
    // sweep can backfill. Better to preserve the user's streak than to
    // 500 when QB is briefly unreachable.
  } else {
    throw err;
  }
}

// Persist with stamp (or null on transport failure).
await sql`
  INSERT INTO hv_sessions (..., governance_stamp)
  VALUES (..., ${stamp ? JSON.stringify(stamp) : null}::jsonb)
`;
```

### 5. Fail policy: REJECT vs UNAVAILABLE

Two different failure modes get two different policies:

| Failure | Engine response | Why |
|---|---|---|
| `verdict.approved === false` (business rejection) | Return 422 with `failureReason` to the client; **do not persist** | QB has actively refused the payload (missing required field, safety violation). Persisting a rejected session would corrupt the audit trail. |
| `QueenBeeUnavailableError` thrown (transport failure) | Persist with `governance_stamp = null`; return 200 to the client | Network blip shouldn't break the user's streak. The unstamped row is visible in queries (`WHERE governance_stamp IS NULL`) so a future sweep can backfill. |

This matches HiveSecretBox's documented policy (per `secret-box/WIRING_QUEEN_BEE.md`) and is the recommended default. Engines whose data is more sensitive (medical, financial) may prefer fail-CLOSED — declare that choice explicitly in their own `WIRING_QUEEN_BEE.md`.

## Configuring QB at runtime

The vendored client reads `QUEEN_BEE_URL` and `QB_ENGINE_TOKEN` from the environment with sensible defaults:

```
QUEEN_BEE_URL=https://queenbee.hive.baby   # default
QB_ENGINE_TOKEN=                            # forward-compat, ignored by QB today
```

Per-call overrides are also supported via the second argument:

```ts
await govern(req, { baseUrl: "https://qb-staging.hive.baby", timeoutMs: 5000 });
```

## Verifying the wiring in production

After the engine deploys:

1. `curl -sI https://vitality.hive.baby/api/health` → 200, `features.queen_bee_url` set
2. POST a sample ritual log and watch the response — `qb.status` should be `"approved"` and `qb.stamp` populated
3. Query `hv_sessions WHERE governance_stamp IS NOT NULL` — every row should have a stamp
4. Hit QB's `/api/audit` — HiveVitality should appear with `governed: true`

## Lifting the engine's QB registry status

Once production traffic confirms `govern()` is being called on every session, open a PR to `queen-bee/lib/registry.ts` flipping `hivevitality.status` from `'planned'` to `'live'`. That signals to other engines that this implementation has been battle-tested and is safe to copy.
