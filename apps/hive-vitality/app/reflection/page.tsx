"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReflectionPage() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    setSubmitting(true);
    try {
      await fetch("/api/log-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ritualDate: new Date().toISOString().slice(0, 10) }),
      });
      setSaved(true);
    } catch {
      setSaved(true); // best-effort; never block the user on a 10-second note
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <main className="shell">
        <p className="eyebrow">HiveVitality · Reflection</p>
        <h1 className="h1">Thanks.</h1>
        <p className="lede">See you tomorrow.</p>
        <Link href="/" className="btn-ghost">Close</Link>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="eyebrow">HiveVitality · Reflection</p>
      <h1 className="h1">Ten seconds.</h1>
      <p className="lede">
        How did the body feel today? One sentence. Skip if you don&apos;t feel like it.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Today my body felt…"
        aria-label="Daily reflection"
        rows={3}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "12px 14px",
          background: "rgba(255,255,255,0.03)",
          color: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          fontSize: 16,
          lineHeight: 1.5,
          resize: "none",
        }}
      />
      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn-gold"
          onClick={save}
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <Link href="/" className="btn-ghost">Skip</Link>
      </div>
    </main>
  );
}
