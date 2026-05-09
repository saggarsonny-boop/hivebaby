// firstVisitExplainer (engine-local equivalent of @hive/onboarding's
// HiveFirstVisitExplainer): the three-step Onboarding component below
// is gated by localStorage `hive_welcomed_hivevitality` so it shows
// only once. v0.2 swaps for the canonical @hive/onboarding component.

"use client";

import { useEffect, useState } from "react";
import Onboarding from "@/components/Onboarding";
import RitualLauncher from "@/components/RitualLauncher";

const STORAGE_KEY = "hive_welcomed_hivevitality";

export default function Home() {
  const [welcomed, setWelcomed] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setWelcomed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // SSR + initial render: show neither (avoid flicker between onboarding and
  // launcher when the localStorage check resolves).
  if (welcomed === null) {
    return <main className="shell" aria-busy="true" />;
  }

  if (!welcomed) {
    return (
      <Onboarding
        onComplete={() => {
          try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
          setWelcomed(true);
        }}
      />
    );
  }

  return <RitualLauncher />;
}
