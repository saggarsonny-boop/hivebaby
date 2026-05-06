"use client";

import { useEffect, useRef, useState } from "react";
import { useInstallPrompt } from "@hive/onboarding";
import { useStrings } from "./strings";

// Layout-level listener for the `appinstalled` event. Mounted in the root
// layout so the success toast survives the InstallHintBanner being
// dismissed (whether by the user, by the appinstalled event itself, or
// just by navigating to a different route).
//
// On iOS, useInstallPrompt's effect short-circuits and never fires
// `installed=true`, so this component renders nothing on iOS — there's no
// reliable equivalent of `appinstalled` on iOS Safari to drive a toast.

const GOLD = "#D4AF37";
const INK = "#0a0a0a";

const TOAST_DURATION_MS = 4000;

export function AppInstalledToast() {
  const s = useStrings();
  const { installed } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!installed) return;
    setVisible(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(false), TOAST_DURATION_MS);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [installed]);

  if (!visible) return null;

  return (
    <div role="status" aria-live="polite" style={toastStyle}>
      {s.install.installedToast}
    </div>
  );
}

const toastStyle: React.CSSProperties = {
  position: "fixed",
  // Anchored at the top so it doesn't collide with the bottom-anchored
  // toast in the pin-set state of /page.tsx (which uses bottom: 24px,
  // z-index 60). Same z-index here so neither obscures the other; only
  // one fires at a time anyway (this one only on `appinstalled`).
  top: "max(env(safe-area-inset-top), 12px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: GOLD,
  color: INK,
  padding: "10px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.01em",
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.55)",
  zIndex: 80,
  maxWidth: "92vw",
  textAlign: "center",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
