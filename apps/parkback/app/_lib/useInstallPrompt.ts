"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Browser-native install-prompt event. Only fires on Chromium-based browsers
// (Chrome, Edge, Samsung Internet, Opera, Brave) and only when the PWA
// install criteria are met (manifest valid, served over HTTPS, SW
// registered, etc.). Never fires on Safari (any platform), Firefox, or
// any iOS browser.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallTriggerResult =
  | "accepted"        // user accepted the native install prompt
  | "dismissed"       // user dismissed the native install prompt
  | "ios-needs-overlay" // caller should open the iOS guided overlay instead
  | "unavailable";    // no install path is available right now

// SSR-safe iOS detection. iPad Pro reports MacIntel + maxTouchPoints>1, so
// the platform check is needed in addition to the user-agent regex.
function detectIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  const platform = (navigator as Navigator & { platform?: string }).platform;
  const maxTouch = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints;
  return platform === "MacIntel" && (maxTouch || 0) > 1;
}

/** Coarse client-platform classification used to decide install-flow copy. */
export type InstallPlatform =
  | "ios"                    // iOS Safari / Chrome / Firefox / etc — guided overlay path
  | "chromium"               // Chromium-derived browser with beforeinstallprompt captured — native prompt path
  | "desktop-safari-firefox" // Desktop Safari or Firefox — no programmatic install, instructional copy
  | "unknown";               // Anything else — generic copy

// Caller must already have ruled out iOS + chromium-installable before calling this.
function detectFallbackPlatform(): "desktop-safari-firefox" | "unknown" {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  // Desktop Safari: contains "Safari" but not Chrome/Edge/CriOS/Firefox markers.
  // (iOS already short-circuited by the caller.)
  if (/Safari/.test(ua) && !/Chrome|CriOS|EdgiOS|FxiOS|Edg\//.test(ua)) {
    return "desktop-safari-firefox";
  }
  // Firefox (desktop or any non-iOS).
  if (/Firefox/.test(ua)) return "desktop-safari-firefox";
  return "unknown";
}

/**
 * Captures the browser's native install prompt where supported, and exposes
 * a single `trigger()` that returns one of four explicit outcomes — including
 * an `ios-needs-overlay` sentinel that tells the caller to open the iOS
 * guided overlay instead of trying to fire a non-existent event.
 *
 * The hook is deliberately split into two code paths by isIOS:
 *
 *   - On iOS: NO event listeners are attached. The hook is effectively a
 *     no-op that just reports `isIOS: true`. This is the lesson from the
 *     PR #70 regression that left iOS Safari rendering only the compass —
 *     we keep the iOS code path entirely untouched by the install logic.
 *
 *   - Off iOS: listens for `beforeinstallprompt` (preventDefault + capture)
 *     and `appinstalled` (toast trigger). All state mutations are wrapped
 *     in try/catch so a future browser quirk in the event payload cannot
 *     blow up React's render tree.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  // Captured in a ref so it's stable across renders without forcing a
  // re-render when first computed.
  const isIOSRef = useRef(false);
  // Mirror in state so callers can render conditionally on it (refs don't
  // trigger re-renders).
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ios = detectIsIOS();
    isIOSRef.current = ios;
    setIsIOS(ios);

    // CRITICAL: do not attach beforeinstallprompt or appinstalled listeners
    // on iOS. The events don't exist there, but past regressions suggest
    // the iOS code path is fragile to any extra listener-related work.
    // Keeping iOS untouched is intentional belt-and-suspenders.
    if (ios) return;

    const onBefore = (e: Event) => {
      try {
        e.preventDefault();
        setDeferred(e as BeforeInstallPromptEvent);
      } catch {
        // Defensive — never let a future browser quirk crash the page.
      }
    };
    const onInstalled = () => {
      try {
        setInstalled(true);
        setDeferred(null);
      } catch {
        // Same defensive posture as above.
      }
    };
    window.addEventListener("beforeinstallprompt", onBefore as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const trigger = useCallback(async (): Promise<InstallTriggerResult> => {
    if (isIOSRef.current) return "ios-needs-overlay";
    if (!deferred) return "unavailable";
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, [deferred]);

  // Coarse platform classification, derived from isIOS + canPromptNatively
  // + a UA-based fallback. Re-derived each render so it updates the moment
  // a deferred event arrives (chromium-installable becomes available).
  const canPromptNatively = deferred !== null;
  let platform: InstallPlatform;
  if (isIOS) {
    platform = "ios";
  } else if (canPromptNatively) {
    platform = "chromium";
  } else {
    // Falls through to UA-based detection. May reclassify to "chromium"
    // later in the session if beforeinstallprompt fires after page load.
    platform = detectFallbackPlatform();
  }

  return {
    /** True iff a beforeinstallprompt event has been captured and is ready to prompt. */
    canPromptNatively,
    /** True iff this client is iOS (any browser). */
    isIOS,
    /** True iff appinstalled has fired this session. */
    installed,
    /** Coarse platform — drives copy + which install path to show. */
    platform,
    /** Try to show an install path. Returns one of the InstallTriggerResult values. */
    trigger,
  };
}
