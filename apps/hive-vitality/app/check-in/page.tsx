"use client";

import { useState } from "react";
import Link from "next/link";

const MOODS = [
  { rating: 1 as const, label: "Heavy" },
  { rating: 2 as const, label: "Tired" },
  { rating: 3 as const, label: "Steady" },
  { rating: 4 as const, label: "Open" },
  { rating: 5 as const, label: "Light" },
];

export default function CheckInPage() {
  const [picked, setPicked] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (picked === null) return;
    try {
      await fetch("/api/log-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodRating: picked, ritualDate: new Date().toISOString().slice(0, 10) }),
      });
    } catch { /* best-effort */ }
    setSaved(true);
  }

  if (saved) {
    return (
      <main className="shell">
        <p className="eyebrow">HiveVitality · Check-in</p>
        <h1 className="h1">Saved.</h1>
        <p className="lede">See you tomorrow.</p>
        <Link href="/" className="btn-ghost">Close</Link>
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="eyebrow">HiveVitality · Weekly check-in</p>
      <h1 className="h1">How is the week going?</h1>
      <p className="lede">Pick a number; the rest is optional.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {MOODS.map((m) => (
          <button
            type="button"
            key={m.rating}
            onClick={() => setPicked(m.rating)}
            aria-pressed={picked === m.rating}
            className="btn-ghost"
            style={{
              minWidth: 96,
              borderColor: picked === m.rating ? "var(--hive-gold)" : "var(--line)",
              color: picked === m.rating ? "var(--hive-gold)" : "var(--muted)",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn-gold"
          onClick={save}
          disabled={picked === null}
        >
          Save
        </button>
      </div>
    </main>
  );
}
