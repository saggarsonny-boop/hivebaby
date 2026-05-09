// Vendored from saggarsonny-boop/queen-bee@main:packages/queen-bee-client/src/errors.ts
// Snapshot 2026-05-09. See ./README.md for sync pattern.

/**
 * Thrown when Queen Bee is unreachable or returns a server error after
 * the single retry. Engines should catch this and apply their own policy
 * (fail-open vs. fail-closed) — see WIRING.md.
 */
export class QueenBeeUnavailableError extends Error {
  readonly code = "QUEEN_BEE_UNAVAILABLE";
  readonly attempts: number;
  readonly cause?: unknown;

  constructor(message: string, attempts: number, cause?: unknown) {
    super(message);
    this.name = "QueenBeeUnavailableError";
    this.attempts = attempts;
    this.cause = cause;
  }
}
