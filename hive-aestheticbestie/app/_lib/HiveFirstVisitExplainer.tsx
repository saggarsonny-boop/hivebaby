"use client";

// HiveFirstVisitExplainer — under-CTA one-line explainer.
// Auto-dismisses on the first successful primary action (signaled via the
// `localStorage` key `hive_welcomed_hiveaestheticbestie` flipping). Shows
// once per device. Matches the canonical first-visit-explainer pattern in
// HiveOps H12.

import { useEffect, useState } from "react";
import { useStrings } from "./strings";

const STORAGE_KEY = "hive_welcomed_hiveaestheticbestie";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

export function HiveFirstVisitExplainer() {
  const s = useStrings();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShow(window.localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!show) return null;
  return (
    <p
      style={{
        margin: "8px auto 16px",
        maxWidth: 520,
        textAlign: "center",
        color: MUTED,
        fontSize: 13,
        lineHeight: 1.6,
        padding: "0 14px",
      }}
      data-component="HiveFirstVisitExplainer"
    >
      <span style={{ color: PAPER }}>
        {s.home.firstVisit.body}
      </span>
    </p>
  );
}
