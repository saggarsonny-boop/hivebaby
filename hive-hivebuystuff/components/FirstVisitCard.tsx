"use client";

import { useState, useEffect } from "react";

const LS_KEY = "hbs_welcomed_hivebuystuff";

type Props = {
  onTryIt: () => void;
};

export default function FirstVisitCard({ onTryIt }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, "1");
    setVisible(false);
  }

  function tryIt() {
    dismiss();
    onTryIt();
  }

  if (!visible) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, rgba(240,165,0,0.06) 100%)",
        border: "1px solid var(--gold-border)",
        borderRadius: 12,
        padding: "1.5rem",
        marginBottom: "1.5rem",
        position: "relative",
      }}
    >
      <button
        onClick={dismiss}
        style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🛒</div>
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.35rem" }}>
        Build once. Buy anywhere.
      </div>
      <div style={{ color: "var(--text-soft)", fontSize: "0.9rem", lineHeight: 1.55, marginBottom: "1rem" }}>
        Save your shopping lists, then run them on Walmart, Target, Amazon, or Instacart.
        AI maps your items to real products. Free forever at the base tier.
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={tryIt}>
          Create my first list →
        </button>
        <button className="btn-ghost" onClick={dismiss} style={{ fontSize: "0.85rem" }}>
          Got it
        </button>
      </div>
    </div>
  );
}
