"use client";

import { useEffect } from "react";
import { strings } from "./strings";

// iOS guided install overlay. Three-step instructions for adding ParkBack
// to the home screen via Safari's share sheet — the only path on iOS,
// since iOS Safari does not fire `beforeinstallprompt`.
//
// Deliberately minimal:
//   - Pure functional component, no createPortal (renders inline as a
//     fixed-position element). Past iOS regressions in this engine
//     (PR #70) suggest createPortal interactions can be fragile on iOS
//     Safari; inline fixed-position is the safest equivalent.
//   - No useLayoutEffect, no document/window measurement at render time.
//   - No external icon dependencies — share + plus icons are inline SVG.
//   - No useState, no refs — open/onClose come from the parent.

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";

function ShareIcon({ size = 18 }: { size?: number }) {
  // iOS Safari share button glyph — square with up arrow rising from it.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}>
      <path d="M12 3v12M12 3l-4 4M12 3l4 4"
            stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
            stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ size = 18 }: { size?: number }) {
  // iOS share-sheet "Add to Home Screen" row glyph — rounded square with plus.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={GOLD} strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IOSInstallOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Lock background scroll while open so the user can't accidentally
  // scroll the page beneath the modal. Restored on unmount / close.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key dismiss for desktop / external keyboard testing.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const o = strings.install.overlay;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={o.ariaLabel}
      onClick={onClose}
      style={backdropStyle}
    >
      <div
        // Stop propagation so clicking inside the card doesn't dismiss.
        onClick={(e) => e.stopPropagation()}
        style={cardStyle}
      >
        <div style={titleStyle}>{o.title}</div>
        <div style={bodyStyle}>{o.body}</div>

        <div style={stepStyle}>
          <span style={stepNumStyle}>1</span>
          <span style={stepTextStyle}>
            {o.step1} <ShareIcon size={18} />
          </span>
        </div>

        <div style={stepStyle}>
          <span style={stepNumStyle}>2</span>
          <span style={stepTextStyle}>
            {o.step2} <PlusIcon size={18} />
          </span>
        </div>

        <div style={stepStyle}>
          <span style={stepNumStyle}>3</span>
          <span style={stepTextStyle}>
            {o.step3}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss install instructions"
          style={dismissButtonStyle}
        >
          {o.dismiss}
        </button>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  // Above toast (60), photo modal (50), A2HS card (default). Anything
  // below this z-index can be obscured.
  zIndex: 70,
  // Respect notched devices.
  paddingTop: "max(env(safe-area-inset-top), 16px)",
  paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
};

const cardStyle: React.CSSProperties = {
  background: INK,
  color: PAPER,
  border: `1px solid ${GOLD_DIM}`,
  borderRadius: 16,
  padding: "20px 18px",
  maxWidth: 360,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const titleStyle: React.CSSProperties = {
  color: GOLD,
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "0.01em",
  lineHeight: 1.3,
};

const bodyStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
};

const stepStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
  marginTop: 4,
};

const stepNumStyle: React.CSSProperties = {
  flex: "0 0 24px",
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: GOLD,
  color: INK,
  fontWeight: 700,
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const stepTextStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
  display: "inline",
};

const dismissButtonStyle: React.CSSProperties = {
  marginTop: 8,
  alignSelf: "flex-end",
  background: GOLD,
  color: INK,
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
