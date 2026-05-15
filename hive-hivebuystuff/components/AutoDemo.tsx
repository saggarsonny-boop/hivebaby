"use client";

import { useState, useEffect, useRef } from "react";

const LS_KEY = "hbs_demo_hivebuystuff";

const DEMO_ITEMS = [
  { original: "whole milk 1 gallon", mapped: "Great Value Whole Milk 1 Gallon", qty: 1 },
  { original: "chicken breast 2 lb", mapped: "GV Boneless Skinless Chicken Breasts 2 lb", qty: 1 },
  { original: "sandwich bread", mapped: "Great Value Classic White Sandwich Bread 20 oz", qty: 1 },
  { original: "bananas", mapped: "Fresh Bananas", qty: 6 },
];

const DEMO_NOTE =
  "Budget brand substitutions applied for all 4 items. Dietary rules checked — no conflicts.";

type Phase = "typing" | "building" | "result" | "done";

export default function AutoDemo() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedText, setTypedText] = useState("");
  const [shownItems, setShownItems] = useState(0);
  const dismissed = useRef(false);

  const fullText = "Weekly Essentials → Walmart";

  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || phase !== "typing") return;
    if (typedText.length >= fullText.length) {
      setTimeout(() => setPhase("building"), 600);
      return;
    }
    const t = setTimeout(() => {
      setTypedText(fullText.slice(0, typedText.length + 1));
    }, 55);
    return () => clearTimeout(t);
  }, [visible, phase, typedText, fullText]);

  useEffect(() => {
    if (phase !== "building") return;
    const t = setTimeout(() => {
      setPhase("result");
      setShownItems(0);
    }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") return;
    if (shownItems >= DEMO_ITEMS.length) {
      const t = setTimeout(dismiss, 7000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShownItems((n) => n + 1), 280);
    return () => clearTimeout(t);
  }, [phase, shownItems]);

  function dismiss() {
    if (dismissed.current) return;
    dismissed.current = true;
    localStorage.setItem(LS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "1.25rem",
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
          fontSize: "0.9rem",
        }}
        aria-label="Close demo"
      >
        ✕
      </button>

      <div style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
        Live Demo
      </div>

      {phase === "typing" && (
        <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.95rem", color: "var(--text)" }}>
          {typedText}
          <span style={{ borderRight: "2px solid var(--gold)", marginLeft: 2, animation: "blink 1s step-end infinite" }} />
        </div>
      )}

      {phase === "building" && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-soft)", fontSize: "0.9rem" }}>
          <span className="spinner" style={{ width: 14, height: 14 }} />
          AI mapping 4 items to Walmart products…
        </div>
      )}

      {phase === "result" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--green)" }}>Cart ready</span>
            <span className="backend-badge">walmart</span>
          </div>
          <div>
            {DEMO_ITEMS.slice(0, shownItems).map((item, i) => (
              <div
                key={i}
                className="cart-item-row"
                style={{ opacity: 1, transition: "opacity 0.2s" }}
              >
                <span className="cart-item-original">{item.original}</span>
                <span className="cart-item-mapped">{item.mapped}</span>
                <span className="cart-item-qty">×{item.qty}</span>
              </div>
            ))}
          </div>
          {shownItems >= DEMO_ITEMS.length && (
            <div className="cart-notes">
              <strong style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.2rem", color: "var(--gold)" }}>Note</strong>
              {DEMO_NOTE}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
