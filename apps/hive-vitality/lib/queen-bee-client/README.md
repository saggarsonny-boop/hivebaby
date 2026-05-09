# Vendored snapshot of `@queen-bee/client`

Canonical source: [`saggarsonny-boop/queen-bee` → `packages/queen-bee-client/src`](https://github.com/saggarsonny-boop/queen-bee/tree/main/packages/queen-bee-client/src).

Snapshot taken: 2026-05-09 from `main` branch (post-PR #7 — adds `vitality-session-log` to `SCHEMA_TYPES`).

## Why vendored

`@queen-bee/client` is not yet npm-published. Per Constitution §V `[INLINE_PACKAGE]`, when a Hive package isn't reachable as a workspace dependency the engine inlines a snapshot into its own `lib/` with a sync pointer. Same shape used by HivePhoto + HAP for `@hive/onboarding`.

## Sync pattern

When QB ships a new client version that this engine needs:

1. `gh repo clone saggarsonny-boop/queen-bee /tmp/qb && cd /tmp/qb`
2. Diff `packages/queen-bee-client/src/*.ts` against the four files in this directory.
3. Port the deltas (preserve the `// vendored from saggarsonny-boop/queen-bee@<sha>` comment headers).
4. Bump the snapshot date in this README.
5. Re-run the engine's HiveOps audit to confirm the new client surface still wires cleanly.

## Files

- `errors.ts` — `QueenBeeUnavailableError` for transport failures.
- `govern.ts` — `govern(req, opts)` entry point. POSTs to `${QUEEN_BEE_URL}/api/govern` with one retry on 5xx + transport. Wraps the wire-level `GrapplerResult` into the friendlier `{approved, stampedContent?, governanceStamp?, failureReason?, failureCode?, schemaErrors?}` Result shape.
- `index.ts` — re-exports the public surface.
- `types.ts` — `SchemaType`, `Tier`, `GovernRequest`, `GovernResponse`, `GovernanceStamp`, `GovernOptions`.

## Engine import path

```ts
import { govern } from "@/lib/queen-bee-client";
```

The TypeScript path alias `@/*` → engine root, declared in `tsconfig.json`. The vendored `index.ts` re-exports `govern` so callers don't need to know about the internal file split. Once `@queen-bee/client` is npm-published, swap `@/lib/queen-bee-client` for `@queen-bee/client` and delete this directory.
