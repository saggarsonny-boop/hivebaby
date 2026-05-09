"use client";

import { useState } from "react";
import IdentityImprint from "./IdentityImprint";
import TibetanIllustration from "./TibetanIllustration";

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    eyebrow: "60 seconds",
    h1: "What is HiveVitality?",
    body:
      "A daily fifteen-minute mobility ritual. Tibetan Rites plus balance plus a deep squat plus a hinge plus bridges plus a plank plus sumo squats. Reps grow with you over ten weeks.",
    cta: "Show me the ritual",
  },
  {
    eyebrow: "60 seconds",
    h1: "Here is what the ritual looks like",
    body:
      "Six rounds. About fifteen minutes. The reps you do today are not the reps you do in week ten — they grow as you do, from three to twenty-one.",
    cta: "Almost there",
  },
  {
    eyebrow: "60 seconds",
    h1: "You are someone who moves every day",
    body:
      "Not a workout. Not a goal. A daily practice you keep with yourself. Tap below when you are ready.",
    cta: "I'm ready",
  },
];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <main className="shell">
      <p className="eyebrow">{current.eyebrow}</p>
      <h1 className="h1">{current.h1}</h1>
      <p className="lede">{current.body}</p>

      {step === 1 && <TibetanIllustration />}
      {step === 2 && <IdentityImprint />}

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn-gold"
          onClick={() => (isLast ? onComplete() : setStep(step + 1))}
        >
          {current.cta}
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 6 }} aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: 24,
              height: 4,
              borderRadius: 2,
              background: i <= step ? "var(--hive-gold)" : "var(--line)",
            }}
          />
        ))}
      </div>
    </main>
  );
}
