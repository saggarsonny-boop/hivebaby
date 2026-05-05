"use client";

import { useCallback, useEffect, useState } from "react";
import { useInstallPrompt } from "./useInstallPrompt";
import { InstallCTA } from "./InstallCTA";
import { useStrings } from "./useStrings";

const STORAGE_KEY_HOME = "parkback_install_hint_dismissed";
const STORAGE_KEY_FIND = "parkback_install_hint_find_dismissed";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

// Banner copy is now sourced from per-locale catalogs via useStrings —
// strings.install.banner.{home,find} for the dead-zone headline,
// strings.install.fallback.{desktopSafariFirefox,unknown} for browsers
// without an install path.

export function InstallHintBanner({ where }: { where: "home" | "find" }) {
  const [show, setShow] = useState(false);
  const { platform, installed } = useInstallPrompt();
  const strings = useStrings();

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

  // appinstalled fires on Chromium when the user accepts the native prompt.
  // Permanently dismiss the banner on both surfaces so it doesn't re-appear
  // on subsequent visits. The success toast is rendered by the layout-level
  // <AppInstalledToast/> so it survives the banner being unmounted here.
  useEffect(() => {
    if (!installed) return;
    setShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY_HOME, "1");
      window.localStorage.setItem(STORAGE_KEY_FIND, "1");
    } catch {
      // localStorage disabled — silently ignore.
    }
  }, [installed]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
      window.localStorage.setItem(key, "1");
    } catch {
      // localStorage might be disabled — silently ignore.
    }
  }, [where]);

  if (!show) return null;

  // Per-platform body copy.
  // - chromium / ios: dead-zone headline + InstallCTA button
  // - desktop-safari-firefox: instructional fallback copy, no CTA
  // - unknown: generic copy, no CTA
  const hasInstallPath = platform === "chromium" || platform === "ios";
  let bodyCopy: string;
  if (hasInstallPath) {
    bodyCopy = where === "find" ? strings.install.banner.find : strings.install.banner.home;
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
const STORAGE_KEY_EXPLAINER = "parkback_first_visit_explainer_dismissed";

export function FirstVisitExplainer() {
  const [show, setShow] = useState(false);
  const strings = useStrings();

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
      {strings.firstVisit.explainer}
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
