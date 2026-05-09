"use client";

import Link from "next/link";
import StreakDisplay from "./StreakDisplay";
import IdentityImprint from "./IdentityImprint";

// v0.1: streak count is a local-storage placeholder until Phase 2 wires
// Clerk + an authenticated /api/me. Production reads from hv_users.
function localStreak(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem("hive_streak_hivevitality");
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function RitualLauncher() {
  const streak = localStreak();

  return (
    <main className="shell">
      <p className="eyebrow">HiveVitality</p>
      <h1 className="h1">Move every day. For yourself.</h1>
      <p className="lede">
        Fifteen minutes. Six rounds. Reps grow from three to twenty-one over
        ten weeks. No equipment. No gym. Free, forever.
      </p>

      <StreakDisplay streakCount={streak} />

      <div style={{ marginTop: 24 }}>
        <Link href="/ritual" className="btn-gold">
          {streak === 0 ? "Start today's ritual" : "Resume today's ritual"}
        </Link>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/check-in" className="btn-ghost">Weekly check-in</Link>
        <Link href="/reflection" className="btn-ghost">Daily reflection</Link>
      </div>

      <IdentityImprint />
    </main>
  );
}
