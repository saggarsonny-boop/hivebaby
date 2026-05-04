"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY_HOME = "hive_install_hint_dismissed_parkback";
const STORAGE_KEY_FIND = "hive_install_hint_dismissed_parkback_find";
const STORAGE_KEY_EXPLAINER = "parkback_first_visit_explainer_dismissed";

const GOLD = "#D4AF37";
const GOLD_HI = "#FFE6A1";
const GOLD_DARK = "#a07f15";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

type Platform = "chromium" | "ios" | "desktop-other" | "unknown";

// Browsers that fire `beforeinstallprompt` (Chrome / Edge / Samsung Internet
// / Opera) get the programmatic-install path. iOS gets the guided overlay.
// Desktop Safari / Firefox get the static "use your browser's install option"
// copy. Everyone else falls back to generic copy.
function detectPlatform(deferredCaptured: boolean): Platform {
  if (typeof navigator === "undefined") return "unknown";
  if (deferredCaptured) return "chromium";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    ((navigator as Navigator & { platform: string }).platform === "MacIntel" &&
      ((navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints || 0) > 1);
  if (isIOS) return "ios";
  // Desktop fallback: pointer:fine = mouse/trackpad with no install event.
  if (typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches) return "desktop-other";
  return "unknown";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

// ─── BeforeInstallPrompt typing ─────────────────────────────────────────────
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// ─── Hook: capture beforeinstallprompt + appinstalled ──────────────────────
function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBefore as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const trigger = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
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

  return { deferred, installed, trigger };
}

// ─── Static copy strings (canonical English source for i18n) ────────────────
const HOME_HEADLINE_CHROMIUM = "Tap to add ParkBack to your home screen";
const HOME_HEADLINE_IOS = "Add ParkBack to your home screen";
const HOME_HEADLINE_DESKTOP_OTHER = "Add ParkBack to your home screen";

const HOME_BODY =
  "Works in any dead zone. No cell signal, wifi, or app store needed. Free, no signup. Your pin, photo, and voice memo are saved on your phone — no cell or wifi signal required to find your car.";

const FIND_BODY =
  "Like what you see? Add ParkBack to your home screen and never lose your own car. Works in any dead zone — no cell signal, wifi, or app store needed. Free, no signup.";

const DESKTOP_OTHER_HINT =
  "Tap the install icon in your address bar, or use your browser's “Add to home screen” option.";

const UNKNOWN_HINT =
  "ParkBack works on any device. Tap the install icon in your address bar or use your browser's “Add to home screen” option. Free, no signup, works offline.";

const APPINSTALLED_TOAST =
  "ParkBack is on your home screen. Open it like any other app.";

// ─── Main banner ────────────────────────────────────────────────────────────
export function InstallHintBanner({ where }: { where: "home" | "find" }) {
  const { deferred, installed, trigger } = useInstallPrompt();
  const [show, setShow] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Decide whether to show the banner at all.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) {
      setShow(false);
      return;
    }
    const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
    try {
      if (window.localStorage.getItem(key) === "1") return;
    } catch {
      return;
    }
    setShow(true);
  }, [where]);

  // appinstalled → toast + auto-dismiss banner forever.
  useEffect(() => {
    if (!installed) return;
    setShow(false);
    setShowOverlay(false);
    setToast(APPINSTALLED_TOAST);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
    try {
      window.localStorage.setItem(STORAGE_KEY_HOME, "1");
      window.localStorage.setItem(STORAGE_KEY_FIND, "1");
    } catch {
      // ignore
    }
  }, [installed]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      const key = where === "find" ? STORAGE_KEY_FIND : STORAGE_KEY_HOME;
      window.localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
  }, [where]);

  const handleInstall = useCallback(async () => {
    const platform = detectPlatform(deferred !== null);
    if (platform === "chromium") {
      const outcome = await trigger();
      if (outcome === "accepted") {
        // appinstalled handler will fire the toast and set the dismiss flag.
      }
      // outcome === "dismissed" → leave the banner up so the user can try again.
      return;
    }
    if (platform === "ios") {
      setShowOverlay(true);
      return;
    }
    // For desktop-other and unknown there's nothing programmatic to do —
    // the static body copy already tells the user how to install.
  }, [deferred, trigger]);

  if (!show) {
    return toast ? <ToastChip text={toast} /> : null;
  }

  const platform = detectPlatform(deferred !== null);
  const headline =
    where === "find"
      ? FIND_BODY
      : platform === "chromium"
      ? HOME_HEADLINE_CHROMIUM
      : platform === "ios"
      ? HOME_HEADLINE_IOS
      : HOME_HEADLINE_DESKTOP_OTHER;
  const body =
    where === "find"
      ? null
      : platform === "chromium"
      ? HOME_BODY
      : platform === "ios"
      ? HOME_BODY
      : platform === "desktop-other"
      ? `${HOME_BODY} ${DESKTOP_OTHER_HINT}`
      : UNKNOWN_HINT;

  // chromium + iOS get a primary CTA. desktop-other / unknown get the
  // static-instruction body and only the dismiss button (their browsers
  // don't expose a programmatic install we can drive).
  const showPrimaryCta = platform === "chromium" || platform === "ios";

  return (
    <>
      <div role="region" aria-label="Install ParkBack" style={bannerStyle}>
        <div style={textStyle}>
          <div style={headlineStyle}>{headline}</div>
          {body ? <div style={bodyStyle}>{body}</div> : null}
          {showPrimaryCta ? (
            <button
              type="button"
              onClick={handleInstall}
              aria-label={
                platform === "chromium"
                  ? "Install ParkBack to your home screen"
                  : "Show me how to add ParkBack to my home screen"
              }
              style={ctaButtonStyle}
            >
              <HexMark size={18} />
              <span>{platform === "chromium" ? "Add to home screen" : "Show me how"}</span>
            </button>
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
      {showOverlay ? <IOSInstallOverlay onClose={() => setShowOverlay(false)} /> : null}
      {toast ? <ToastChip text={toast} /> : null}
    </>
  );
}

// ─── iOS guided overlay ─────────────────────────────────────────────────────
function IOSInstallOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Add ParkBack to home screen" style={overlayStyle} onClick={onClose}>
      <div style={overlayPanelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={overlayTitleStyle}>Add ParkBack to your home screen</div>

        <ol style={stepsStyle}>
          <li style={stepStyle}>
            <span style={stepNumStyle}>1</span>
            <div style={stepTextStyle}>
              Tap the <ShareIcon /> Share button at the bottom of Safari.
            </div>
          </li>
          <li style={stepStyle}>
            <span style={stepNumStyle}>2</span>
            <div style={stepTextStyle}>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </div>
          </li>
          <li style={stepStyle}>
            <span style={stepNumStyle}>3</span>
            <div style={stepTextStyle}>
              Tap <strong>Add</strong> in the top right.
            </div>
          </li>
        </ol>

        <div style={overlayFootnoteStyle}>
          Once added, the ParkBack hexagon icon will live on your home screen. Open it like any other app.
        </div>

        <button type="button" onClick={onClose} style={overlayDismissStyle}>
          Got it
        </button>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function ToastChip({ text }: { text: string }) {
  return <div role="status" style={toastStyle}>{text}</div>;
}

// ─── Inline hexagon mark for the install CTA ────────────────────────────────
function HexMark({ size }: { size: number }) {
  // Single SVG: gold hexagon with the same gradient + rim treatment as
  // ParkBack's primary HexButton, scaled down for inline use.
  const h = Math.round(size * 0.866);
  return (
    <svg
      viewBox="0 0 100 86.6"
      width={size}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "inline-block", flex: "0 0 auto", marginRight: 6, verticalAlign: "middle" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hex-mark-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="50%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>
      <polygon
        points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
        fill="url(#hex-mark-rim)"
        stroke={GOLD_DIM}
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// iOS share icon — small SVG to keep the step copy unambiguous.
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 16 18"
      width="14"
      height="16"
      style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 2 }}
      aria-hidden="true"
    >
      <path
        d="M8 1 L8 12 M8 1 L4 5 M8 1 L12 5 M2 9 L2 16 L14 16 L14 9"
        stroke={GOLD}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── First-visit explainer (carry-over from earlier PRs) ────────────────────
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

// ─── Styles ────────────────────────────────────────────────────────────────
const bannerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  marginTop: 8,
  marginBottom: 4,
  padding: "12px 14px 14px 16px",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  borderRadius: 12,
  border: `1px solid ${GOLD_DIM}`,
  background: "linear-gradient(180deg, rgba(212, 175, 55, 0.10) 0%, rgba(212, 175, 55, 0.04) 100%)",
  color: PAPER,
  fontSize: 13,
  lineHeight: 1.45,
  textAlign: "left",
  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
};

const textStyle: React.CSSProperties = { flex: 1, color: PAPER, display: "flex", flexDirection: "column", gap: 8 };

const headlineStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1.3,
};

const bodyStyle: React.CSSProperties = { color: PAPER, fontSize: 12.5, lineHeight: 1.45 };

const ctaButtonStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  marginTop: 4,
  display: "inline-flex",
  alignItems: "center",
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  borderRadius: 999,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.02em",
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

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 70,
  padding: 16,
};

const overlayPanelStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "#0f1218",
  border: `1px solid ${GOLD_DIM}`,
  borderRadius: 14,
  padding: "20px 22px",
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
  boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
};

const overlayTitleStyle: React.CSSProperties = {
  color: GOLD,
  fontSize: 17,
  fontWeight: 700,
  marginBottom: 14,
  letterSpacing: "0.01em",
};

const stepsStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const stepStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

const stepNumStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: GOLD,
  color: INK,
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const stepTextStyle: React.CSSProperties = { color: PAPER, fontSize: 13.5, lineHeight: 1.45 };

const overlayFootnoteStyle: React.CSSProperties = {
  marginTop: 14,
  color: MUTED,
  fontSize: 12.5,
  lineHeight: 1.45,
  fontStyle: "italic",
};

const overlayDismissStyle: React.CSSProperties = {
  marginTop: 18,
  width: "100%",
  background: GOLD,
  color: INK,
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "max(env(safe-area-inset-bottom), 28px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: GOLD,
  color: INK,
  padding: "10px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
  zIndex: 80,
  maxWidth: "calc(100vw - 32px)",
  textAlign: "center",
};

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


// ─── Post-primary-action install prompt ─────────────────────────────────────
// Shown once after the user successfully completes their first primary action
// (e.g. drops their first pin in ParkBack). Same platform branching as the
// banner: Chromium → programmatic, iOS → guided overlay, others → static
// instructions. Persisted in localStorage under
// hive_post_action_install_prompt_dismissed_<engine>.

const STORAGE_KEY_POST_ACTION = "hive_post_action_install_prompt_dismissed_parkback";

const POST_ACTION_TITLE_CHROMIUM = "Add ParkBack to your home screen";
const POST_ACTION_TITLE_OTHER = "Add ParkBack to your home screen";
const POST_ACTION_BODY =
  "The whole thing — your pin, photo, voice memo, and the compass back to your car — works without cell signal or wifi. Even in the deepest parking deck.";

export function PostActionInstallPrompt({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const { deferred, installed, trigger } = useInstallPrompt();
  const [showOverlay, setShowOverlay] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // appinstalled — fire confirmation toast and dismiss.
  useEffect(() => {
    if (!installed) return;
    setToast(APPINSTALLED_TOAST);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
    try {
      window.localStorage.setItem(STORAGE_KEY_POST_ACTION, "1");
    } catch {
      // ignore
    }
    onDismiss();
  }, [installed, onDismiss]);

  if (!visible && !toast) return null;

  const handleAction = async () => {
    const platform = detectPlatform(deferred !== null);
    if (platform === "chromium") {
      await trigger();
      // installed effect handles cleanup on accept; on dismiss we leave it open.
      return;
    }
    if (platform === "ios") {
      setShowOverlay(true);
      return;
    }
    // desktop-other / unknown: nothing programmatic; the body copy already
    // explains the install is via browser address bar / menu.
  };

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY_POST_ACTION, "1");
    } catch {
      // ignore
    }
    onDismiss();
  };

  if (!visible) {
    return toast ? <ToastChip text={toast} /> : null;
  }

  const platform = detectPlatform(deferred !== null);
  const title =
    platform === "chromium" ? POST_ACTION_TITLE_CHROMIUM : POST_ACTION_TITLE_OTHER;
  const showCta = platform === "chromium" || platform === "ios";

  return (
    <>
      <div role="dialog" aria-label="Add ParkBack to home screen" style={postActionStyle}>
        <div style={postActionTitleStyle}>{title}</div>
        <div style={postActionBodyStyle}>{POST_ACTION_BODY}</div>
        <div style={postActionRowStyle}>
          {showCta ? (
            <button type="button" onClick={handleAction} style={postActionPrimaryStyle}>
              <HexMark size={16} />
              <span>{platform === "chromium" ? "Add to home screen" : "Show me how"}</span>
            </button>
          ) : null}
          <button type="button" onClick={dismiss} style={postActionDismissStyle}>
            Got it
          </button>
        </div>
      </div>
      {showOverlay ? <IOSInstallOverlay onClose={() => setShowOverlay(false)} /> : null}
      {toast ? <ToastChip text={toast} /> : null}
    </>
  );
}

// Helper to check if the post-action prompt should be shown for a given
// engine — call from the parent component once it has determined the user
// has completed their primary action for the first time.
export function shouldShowPostActionInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_POST_ACTION) !== "1";
  } catch {
    return false;
  }
}

const postActionStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 12,
  border: `1px solid ${GOLD_DIM}`,
  background: "linear-gradient(180deg, rgba(212, 175, 55, 0.10) 0%, rgba(212, 175, 55, 0.04) 100%)",
  color: PAPER,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  maxWidth: 380,
  textAlign: "left",
  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
};

const postActionTitleStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1.3,
};

const postActionBodyStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 13,
  lineHeight: 1.5,
};

const postActionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 4,
};

const postActionPrimaryStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  borderRadius: 999,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const postActionDismissStyle: React.CSSProperties = {
  background: "transparent",
  color: MUTED,
  border: "none",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
};
