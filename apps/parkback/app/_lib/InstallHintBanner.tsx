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

const HOME_COPY: Record<Platform, string> = {
  ios:
    "Add ParkBack to your home screen for one-tap access. Tap the Share button below, then “Add to Home Screen.” No app store needed — it’s free, no signup, works offline.",
  android:
    "Add ParkBack to your home screen for one-tap access. Tap the three-dot menu (top right), then “Install app” or “Add to Home Screen.” No app store needed — it’s free, no signup, works offline.",
  desktop:
    "ParkBack works on any device. Tap the install icon in your address bar to add it as an app. Free, no signup, works offline.",
  unknown:
    "Add ParkBack to your home screen for one-tap access. No app store needed — it’s free, no signup, works offline.",
};

const FIND_COPY: Record<Platform, string> = {
  ios:
    "Like what you see? Add ParkBack to your home screen and never lose your own car. Tap the Share button below, then “Add to Home Screen.”",
  android:
    "Like what you see? Add ParkBack to your home screen and never lose your own car. Tap the three-dot menu (top right), then “Install app” or “Add to Home Screen.”",
  desktop:
    "Like what you see? ParkBack works on any device — tap the install icon in your address bar to add it as an app.",
  unknown:
    "Like what you see? Add ParkBack to your home screen and never lose your own car. No app store needed.",
};

export function InstallHintBanner({ where }: { where: "home" | "find" }) {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
    try {
      if (window.localStorage.getItem(key) === "1") return;
    } catch {
      return;
    }
    setPlatform(detectPlatform());
    setShow(true);
  }, [where]);

  if (!show) return null;

  const copy = where === "find" ? FIND_COPY[platform] : HOME_COPY[platform];

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
      Tap when you park. Come back, tap again, find your car. That’s it.
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
