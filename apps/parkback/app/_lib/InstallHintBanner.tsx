"use client";

import { useCallback, useEffect, useState } from "react";
import { useInstallPrompt } from "./useInstallPrompt";
import { InstallCTA } from "./InstallCTA";
import { strings } from "./strings";

const STORAGE_KEY = "hive_install_hint_dismissed_parkback";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

// Dead-zone framing — the headline that gets users to install. Used on
// chromium and iOS where there's an actual install path to drive. The
// fallback platforms (desktop Safari/Firefox/unknown) get different copy
// from `strings.install.fallback.*` because they cannot programmatically
// install.
const HOME_BANNER =
  "Add ParkBack to your home screen. Works in any dead zone. No cell signal, wifi, or app store needed. Free, no signup. Your pin, photo, and voice memo are saved on your phone — no cell or wifi signal required to find your car.";

const FIND_BANNER =
  "Like what you see? Add ParkBack to your home screen and never lose your own car. Works in any dead zone — no cell signal, wifi, or app store needed. Free, no signup.";

export function InstallHintBanner({ where }: { where: "home" | "find" }) {
  const [show, setShow] = useState(false);
  const { platform, installed } = useInstallPrompt();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }
    setShow(true);
  }, [where]);

  // appinstalled fires on Chromium when the user accepts the native prompt.
  // Permanently dismiss the banner on both surfaces so it doesn't re-appear
  // on subsequent visits. The success toast is rendered by the layout-level
  // <AppInstalledToast/> so it survives the banner being unmounted here.
  useEffect(() => {
    if (!installed) return;
    setShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage disabled — silently ignore.
    }
  }, [installed]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage might be disabled — silently ignore.
    }
  }, []);

  if (!show) return null;

  // Per-platform body copy.
  // - chromium / ios: dead-zone headline + InstallCTA button
  // - desktop-safari-firefox: instructional fallback copy, no CTA
  // - unknown: generic copy, no CTA
  const hasInstallPath = platform === "chromium" || platform === "ios";
  let bodyCopy: string;
  if (hasInstallPath) {
    bodyCopy = where === "find" ? FIND_BANNER : HOME_BANNER;
  } else if (platform === "desktop-safari-firefox") {
    bodyCopy = strings.install.fallback.desktopSafariFirefox;
  } else {
    bodyCopy = strings.install.fallback.unknown;
  }

  return (
    <div role="region" aria-label="Install ParkBack" style={bannerStyle}>
      <div style={contentColumnStyle}>
        <div style={textStyle}>{bodyCopy}</div>
        {hasInstallPath ? (
          <div style={ctaRowStyle}>
            <InstallCTA size="sm" />
          </div>
        ) : null}
      </div>
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
  padding: "10px 14px 12px 16px",
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

const contentColumnStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const textStyle: React.CSSProperties = {
  color: PAPER,
};

const ctaRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  marginTop: 2,
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
const STORAGE_KEY_EXPLAINER = "hive_first_visit_seen_parkback";

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
