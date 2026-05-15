"use client";

import { useState } from "react";

type Props = { userId: string };
type Phase = "idle" | "set" | "restore" | "saving" | "looking";

export default function MagicKey({ userId }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function saveKey() {
    if (key.length < 8) { setError("Key must be at least 8 characters."); return; }
    setPhase("saving");
    setError("");
    const res = await fetch("/api/hbs/magic-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, key }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save key.");
      setPhase("set");
    } else {
      setSuccess("Key saved. Enter it on any device to restore your lists and preferences.");
      setPhase("idle");
      setKey("");
    }
  }

  async function lookupKey() {
    if (key.length < 8) { setError("Key must be at least 8 characters."); return; }
    setPhase("looking");
    setError("");
    const res = await fetch(`/api/hbs/magic-key?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    if (!res.ok) {
      setError("Key not found. Check the spelling and try again.");
      setPhase("restore");
    } else if (data.user_id === userId) {
      setSuccess("That's your key — you're already synced.");
      setPhase("idle");
    } else {
      localStorage.setItem("hbs_user_id", data.user_id);
      setSuccess("Identity restored. Reloading…");
      setTimeout(() => window.location.reload(), 1200);
    }
  }

  return (
    <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1.25rem" }}>
      <label className="hbs-label">Sync across devices</label>
      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>
        Set a private passphrase to carry your lists and preferences to any browser.
        We never store the passphrase itself — only a one-way hash.
      </div>

      {success && (
        <div style={{ color: "var(--green)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          ✓ {success}
        </div>
      )}

      {phase === "idle" && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => { setPhase("set"); setError(""); setSuccess(""); }}>
            Set a magic key
          </button>
          <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => { setPhase("restore"); setError(""); setSuccess(""); }}>
            Restore on this device
          </button>
        </div>
      )}

      {(phase === "set" || phase === "restore" || phase === "saving" || phase === "looking") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
          <input
            className="hbs-input"
            type="password"
            placeholder="8+ character passphrase"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            autoFocus
            disabled={phase === "saving" || phase === "looking"}
          />
          {error && <div style={{ color: "var(--red)", fontSize: "0.8rem" }}>{error}</div>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(phase === "set" || phase === "saving") && (
              <button className="btn-primary" style={{ fontSize: "0.82rem" }} onClick={saveKey} disabled={phase === "saving"}>
                {phase === "saving" ? "Saving…" : "Save key"}
              </button>
            )}
            {(phase === "restore" || phase === "looking") && (
              <button className="btn-primary" style={{ fontSize: "0.82rem" }} onClick={lookupKey} disabled={phase === "looking"}>
                {phase === "looking" ? "Looking up…" : "Restore"}
              </button>
            )}
            <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => { setPhase("idle"); setKey(""); setError(""); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
