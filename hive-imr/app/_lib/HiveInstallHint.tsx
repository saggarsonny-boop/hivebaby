"use client";

// HiveInstallHint — engine-local PWA install hint banner.
// Detects the install path and renders the right CTA: programmatic install
// via `beforeinstallprompt` on Chromium / Android, a guided iOS Safari
// overlay on iOS, and a fallback hint elsewhere. Dismissals persist via
// localStorage key `hive_install_hint_dismissed_hiveimr`.

import { useEffect, useMemo, useState } from "react";
import { useStrings } from "./strings";

const STORAGE_KEY = "hive_install_hint_dismissed_hiveimr";
const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const INK = "#0a0a0a";

type InstallPath = "chromium" | "ios" | "fallback";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPath(): InstallPath {
  if (typeof window === "undefined") return "fallback";
  const ua = window.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isIOS) return "ios";
  return "chromium";
}

export function HiveInstallHint() {
  const s = useStrings();
  const [dismissed, setDismissed] = useState(true);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const path = useMemo(detectPath, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  const onClickInstall = async () => {
    if (path === "chromium" && installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") dismiss();
      else setInstallEvent(null);
      return;
    }
    if (path === "ios") {
      window.alert(
        "Tap the Share button in Safari, then 'Add to Home Screen'.",
      );
      return;
    }
    dismiss();
  };

  const banner = s.home.install.banner;
  return (
    <div
      role="region"
      aria-label={banner.regionAria}
      style={{
        margin: "12px auto",
        maxWidth: 520,
        padding: "12px 14px",
        background: INK,
        color: PAPER,
        border: `1px solid ${GOLD}`,
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <p style={{ margin: 0 }}>{banner.home}</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={dismiss}
          aria-label={banner.dismissAria}
          style={{
            background: "transparent",
            color: PAPER,
            border: `1px solid ${PAPER}`,
            borderRadius: 999,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Not now
        </button>
        <button
          onClick={onClickInstall}
          style={{
            background: GOLD,
            color: INK,
            border: 0,
            borderRadius: 999,
            padding: "6px 14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add to home screen
        </button>
      </div>
    </div>
  );
}
