"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY_HOME = "parkback_install_hint_dismissed";
const STORAGE_KEY_FIND = "parkback_install_hint_find_dismissed";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    ((navigator as Navigator & { platform: string }).platform === "MacIntel" &&
      ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints || 0) > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  // Treat anything with a normal mouse-based browser as desktop.
  if (typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

// Single canonical home banner string. Dead-zone capability is the headline,
// not "works offline" boilerplate that users glaze past. Same string ships
// for every platform — iOS Safari and Android Chrome both surface their own
// install affordances when the manifest is present.
const HOME_BANNER =
  "Add ParkBack to your home screen. Works in any dead zone. No cell signal, wifi, or app store needed. Free, no signup. Your pin, photo, and voice memo are saved on your phone — no cell or wifi signal required to find your car.";

// Recipient-flavoured banner. Same dead-zone framing as the home banner, but
// addressed to someone who arrived via a shared spot link — they've already
// seen the value, this is the conversion ask.
const FIND_BANNER =
  "Like what you see? Add ParkBack to your home screen and never lose your own car. Works in any dead zone — no cell signal, wifi, or app store needed. Free, no signup.";

export function InstallHintBanner({ where }: { where: "home" | "find" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
    try {
      if (window.localStorage.getItem(key) === "1") return;
    } catch {
      return;
    }
    setShow(true);
  }, [where]);

  if (!show) return null;

  const copy = where === "find" ? FIND_BANNER : HOME_BANNER;

  const dismiss = () => {
    setShow(false);
    try {
      const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
      window.localStorage.setItem(key, "1");
    } catch {
      // localStorage might be disabled — silently ignore.
    }
  };

  return (
    <div role="region" aria-label="Install ParkBack" style={bannerStyle}>
      <div style={textStyle}>{copy}</div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install hint"
        style={dismissBtnStyle}
      >
        ×
      </button>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  marginTop: 8,
  marginBottom: 4,
  padding: "10px 14px 10px 16px",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  borderRadius: 12,
  border: `1px solid ${GOLD_DIM}`,
  background:
    "linear-gradient(180deg, rgba(212, 175, 55, 0.10) 0%, rgba(212, 175, 55, 0.04) 100%)",
  color: PAPER,
  fontSize: 13,
  lineHeight: 1.45,
  textAlign: "left",
  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
};

const textStyle: React.CSSProperties = {
  flex: 1,
  color: PAPER,
};

const dismissBtnStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: 28,
  height: 28,
  background: "transparent",
  color: MUTED,
  border: "none",
  borderRadius: 6,
  fontSize: 22,
  lineHeight: 1,
  cursor: "pointer",
  padding: 0,
  marginTop: -2,
};

// First-visit one-line explainer shown under the Drop pin button. Auto-hides
// once the user successfully drops a pin (the parent component is responsible
// for not rendering this when a pin exists; this helper just persists
// "I've dismissed it forever" once explicitly dismissed or once a pin has
// been dropped).
const STORAGE_KEY_EXPLAINER = "parkback_first_visit_explainer_dismissed";

export function FirstVisitExplainer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY_EXPLAINER) === "1") return;
    } catch {
      return;
    }
    setShow(true);
  }, []);

  if (!show) return null;
  return (
    <div style={explainerStyle}>
      Tap when you park. Come back, tap again, walk straight to your car. Works in underground garages with zero cell or wifi signal. Your phone’s GPS does the work.
    </div>
  );
}

export function dismissFirstVisitExplainer() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_EXPLAINER, "1");
  } catch {
    // ignore
  }
}

const explainerStyle: React.CSSProperties = {
  marginTop: 14,
  color: GOLD,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.01em",
  maxWidth: 320,
  textAlign: "center",
  lineHeight: 1.4,
};
