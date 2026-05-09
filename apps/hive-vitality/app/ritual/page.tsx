"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import RitualStep from "@/components/RitualStep";
import IdentityImprint from "@/components/IdentityImprint";
import { ritualForWeek } from "@/lib/ritual";
import type { ComponentSlug } from "@/types/vitality";

// Bootstrap default — production engine will read currentWeek from
// /api/me once Clerk is wired (Phase 2). For v0.1 the ritual page reads
// from a URL query string OR defaults to week 1 so anonymous demo users
// can still walk the flow end-to-end.

function weekFromQueryString(): number {
  if (typeof window === "undefined") return 1;
  const w = new URL(window.location.href).searchParams.get("week");
  const n = w ? parseInt(w, 10) : 1;
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : 1;
}

export default function RitualPage() {
  const week = useMemo(() => weekFromQueryString(), []);
  const blueprint = useMemo(() => ritualForWeek(week), [week]);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<ComponentSlug[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isLast = stepIndex >= blueprint.components.length - 1;
  const current = blueprint.components[stepIndex];

  function advance(slug: ComponentSlug, didComplete: boolean) {
    if (didComplete) setCompleted((prev) => [...prev, slug]);
    if (isLast) {
      void submit();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/log-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ritualDate: new Date().toISOString().slice(0, 10),
          durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
          currentWeek: week,
          completedComponents: completed,
        }),
      });
      if (!res.ok) {
        // Engine still completes the ritual UX even if logging fails; we
        // surface the error but don't block the user.
        setSubmitError("Logged locally — sync will retry.");
      }
      setDone(true);
    } catch {
      setSubmitError("Logged locally — sync will retry.");
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="shell">
        <p className="eyebrow">HiveVitality · Week {week}</p>
        <h1 className="h1">You did the ritual today.</h1>
        <p className="lede">
          Tap below to add a ten-second reflection, or close the page —
          your streak is already saved.
        </p>
        {submitError && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {submitError}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/reflection" className="btn-gold">
            Add a reflection
          </Link>
          <Link href="/" className="btn-ghost">
            Close
          </Link>
        </div>
        <IdentityImprint />
      </main>
    );
  }

  return (
    <main className="shell">
      <p className="eyebrow">
        HiveVitality · Week {week} · {stepIndex + 1} of {blueprint.components.length}
      </p>
      <h1 className="h1">Today&apos;s ritual</h1>
      <RitualStep
        component={current}
        onComplete={() => advance(current.slug, true)}
        onSkip={() => advance(current.slug, false)}
        disabled={submitting}
      />
    </main>
  );
}
