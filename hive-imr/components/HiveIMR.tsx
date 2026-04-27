"use client";

/*
 * Phase 2 placeholder.
 *
 * Awaiting Thomas's full component source. The intended drop is the React
 * skeleton with role selector, three demo patients (Marcus Chen, Dorothy
 * Okafor, Raymond Alcazar), and the AI panel that streams via the
 * `/api/ai/generate` server route.
 *
 * Replace the entire contents of this file with the real component when it
 * lands, then redeploy.
 */
export default function HiveIMR() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">HiveIMR — Phase 2</p>
        <h1>Component awaiting drop-in.</h1>
        <p className="lede">
          Page wrapper and <code>/api/ai/generate</code> streaming proxy are
          live. Replace <code>hive-imr/components/HiveIMR.tsx</code> with the
          full component to bring up the role selector, demo patient list, and
          AI panel.
        </p>
        <p className="status">
          POST to <code>/api/ai/generate</code> with{" "}
          <code>{`{ prompt, role?, patientId? }`}</code> — streams Anthropic
          SSE back to the client.
        </p>
      </header>
    </main>
  );
}
