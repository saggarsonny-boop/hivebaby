"use client";

import { useEffect, useState } from "react";
import TibetanIllustration from "./TibetanIllustration";
import type { RitualComponent } from "@/types/vitality";

interface Props {
  component: RitualComponent;
  onComplete: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

export default function RitualStep({ component, onComplete, onSkip, disabled }: Props) {
  // For seconds-unit components we run a soft countdown so the user has a
  // visual rhythm; reps-unit components just display the target count and
  // let the user tap "Done" when finished. Either way, "Done" advances.
  const isTimer = component.unit === "seconds";
  const [remaining, setRemaining] = useState(component.baseValue);

  useEffect(() => {
    setRemaining(component.baseValue);
  }, [component.slug, component.baseValue]);

  useEffect(() => {
    if (!isTimer) return;
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [isTimer, remaining]);

  const value = isTimer ? remaining : component.baseValue;
  const unitLabel = isTimer ? "seconds" : "reps";

  return (
    <section className="ritual-step" aria-label={component.title}>
      <p className="eyebrow">{component.title}</p>
      <TibetanIllustration slug={component.slug} />
      <p className="ritual-step__coach">{component.coach}</p>
      <p className="ritual-step__count" aria-live="polite">
        {value}
      </p>
      <p className="ritual-step__unit">{unitLabel}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn-gold"
          onClick={onComplete}
          disabled={disabled}
        >
          Done
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onSkip}
          disabled={disabled}
        >
          Skip this one
        </button>
      </div>
    </section>
  );
}
