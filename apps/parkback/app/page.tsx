"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  bearingDegrees,
  formatDistance,
  formatElapsed,
  haversineMeters,
  navigateUrl,
} from "./_lib/geo";
import { useCompass } from "./_lib/useCompass";
import { Figure8 } from "./_lib/Figure8";
import { track } from "./_lib/analytics";
import { buildShareUrl } from "./_lib/share";
import { HiveFooter } from "./_lib/HiveFooter";
import { HexButton } from "./_lib/HexButton";
import {
  HiveInstallHint,
  HiveFirstVisitExplainer,
  dismissHiveFirstVisitExplainer,
  HiveAHTSPrompt,
} from "@hive/onboarding";
import { useStrings } from "./_lib/strings";

// ParkBack's engine identity for the shared @hive/onboarding components.
// Lives here (rather than imported from a config) so a future engine
// renaming touches one file.
const ENGINE_NAME = "ParkBack";
const ENGINE_SLUG = "parkback";

const STORAGE_KEY = "parkback_pin_v1";
const A2HS_DISMISSED_KEY = "hive_ahts_dismissed_parkback";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}
const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";
const MAX_VOICE_MS = 30_000;
const MAX_PHOTO_WIDTH = 800;

type Pin = {
  lat: number;
  lng: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  timestamp: number;
  landmark: string | null;
  photo: string | null;
  voiceMemo: string | null;
};

type PermState = "idle" | "requesting" | "denied" | "unavailable";

function loadPin(): Pin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat !== "number" || typeof parsed?.lng !== "number") return null;
    return parsed as Pin;
  } catch {
    return null;
  }
}

function savePin(pin: Pin) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pin));
}

function clearPin() {
  window.localStorage.removeItem(STORAGE_KEY);
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "Accept-Language": "en" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const parts = [a.road || a.pedestrian || a.footway, a.neighbourhood || a.suburb, a.city || a.town || a.village];
    const joined = parts.filter(Boolean).join(", ");
    return joined || data.display_name || null;
  } catch {
    return null;
  }
}

async function compressImage(file: File): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });
  const ratio = Math.min(1, MAX_PHOTO_WIDTH / img.naturalWidth);
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ParkBackPage() {
  const s = useStrings();
  const [pin, setPin] = useState<Pin | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [perm, setPerm] = useState<PermState>("idle");
  const [permMessage, setPermMessage] = useState<string>("");
  const [now, setNow] = useState<number>(() => Date.now());
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [recState, setRecState] = useState<"idle" | "recording" | "saving">("idle");
  const [recElapsed, setRecElapsed] = useState(0);
  const [photoSkipped, setPhotoSkipped] = useState(false);
  const [voiceSkipped, setVoiceSkipped] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showA2HS, setShowA2HS] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const { state: compassState, heading: compassHeading, requestPermission: requestCompassPermission } =
    useCompass(!!pin);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef<number>(0);
  const recTimerRef = useRef<number | null>(null);
  const recStopTimeoutRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    setPin(loadPin());
    setHydrated(true);
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Silent — the app still works without SW.
    });
  }, []);

  // Tick "time elapsed" every 15s
  useEffect(() => {
    if (!pin) return;
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [pin]);

  // Watch current position when a pin is set, for distance/bearing
  useEffect(() => {
    if (!pin) {
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setHere(null);
      return;
    }
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 }
    );
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [pin]);

  const dropPin = useCallback(async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setPerm("unavailable");
      setPermMessage(s.perm.noBrowserSupport);
      return;
    }
    setPerm("requesting");
    setPermMessage("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, heading } = pos.coords;
        const draft: Pin = {
          lat: latitude,
          lng: longitude,
          accuracy: typeof accuracy === "number" ? accuracy : null,
          altitude: typeof altitude === "number" ? altitude : null,
          heading: typeof heading === "number" && !Number.isNaN(heading) ? heading : null,
          timestamp: pos.timestamp || Date.now(),
          landmark: null,
          photo: null,
          voiceMemo: null,
        };
        // Save immediately so we don't lose the pin if reverse geocoding fails.
        savePin(draft);
        setPin(draft);
        setPerm("idle");
        setPhotoSkipped(false);
        setVoiceSkipped(false);
        track("pin_dropped", { has_altitude: draft.altitude !== null });
        dismissHiveFirstVisitExplainer(ENGINE_SLUG);
        showToast(s.toasts.savedAck);

        // Show the post-pin-drop "Add to Home Screen" prompt on every
        // platform (HiveAHTSPrompt internally renders the right install
        // path: native CTA on Chromium, guided overlay on iOS, or
        // instructional fallback on desktop Safari/Firefox/unknown).
        // Skip if already standalone or the user permanently dismissed it.
        if (
          !isStandalone() &&
          window.localStorage.getItem(A2HS_DISMISSED_KEY) !== "1"
        ) {
          setShowA2HS(true);
        }

        const landmark = await reverseGeocode(latitude, longitude);
        if (landmark) {
          const enriched = { ...draft, landmark };
          savePin(enriched);
          setPin(enriched);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPerm("denied");
          setPermMessage(s.perm.denied);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setPerm("unavailable");
          setPermMessage(s.perm.unavailable);
        } else {
          setPerm("unavailable");
          setPermMessage(s.perm.timeout);
        }
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 }
    );
  }, [s, showToast]);

  const handleClear = useCallback(() => {
    if (!window.confirm(s.toasts.forgetConfirm)) return;
    clearPin();
    setPin(null);
    setPhotoSkipped(false);
    setVoiceSkipped(false);
    setRecState("idle");
    setPhotoOpen(false);
    setShowA2HS(false);
  }, [s]);

  const dismissA2HS = useCallback(() => {
    setShowA2HS(false);
    try {
      window.localStorage.setItem(A2HS_DISMISSED_KEY, "1");
    } catch {
      // localStorage might be disabled — silently ignore.
    }
  }, []);

  const handleNavigate = useCallback(() => {
    if (!pin) return;
    window.location.href = navigateUrl(pin);
  }, [pin]);

  const handleShare = useCallback(async () => {
    if (!pin) return;
    const shareUrl = buildShareUrl({
      lat: pin.lat,
      lng: pin.lng,
      timestamp: pin.timestamp,
      landmark: pin.landmark,
    });
    const text = pin.landmark
      ? `${s.share.messageNearPrefix} ${pin.landmark}.`
      : s.share.messageNoLandmark;
    track("share_link_generated", { has_landmark: pin.landmark !== null });

    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: s.share.title,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(s.toasts.linkCopied);
    } catch {
      window.prompt(s.share.promptDialog, shareUrl);
    }
  }, [pin, showToast, s]);

  const handleTakePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePhotoSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pin) return;
    try {
      const dataUrl = await compressImage(file);
      const updated: Pin = { ...pin, photo: dataUrl };
      savePin(updated);
      setPin(updated);
      track("photo_taken");
    } catch {
      alert(s.errors.photoFailed);
    }
  }, [pin, s]);

  const stopRecording = useCallback(() => {
    if (recTimerRef.current !== null) {
      window.clearInterval(recTimerRef.current);
      recTimerRef.current = null;
    }
    if (recStopTimeoutRef.current !== null) {
      window.clearTimeout(recStopTimeoutRef.current);
      recStopTimeoutRef.current = null;
    }
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (!pin) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      alert(s.errors.voiceUnsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      recStartRef.current = Date.now();
      setRecElapsed(0);

      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecState("saving");
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const dataUrl = await blobToDataUrl(blob);
          const current = loadPin() || pin;
          const updated: Pin = { ...current, voiceMemo: dataUrl };
          savePin(updated);
          setPin(updated);
          track("voice_memo_recorded", { duration_ms: Date.now() - recStartRef.current });
        } catch {
          alert(s.errors.voiceSaveFailed);
        } finally {
          setRecState("idle");
          setRecElapsed(0);
          recorderRef.current = null;
          chunksRef.current = [];
        }
      };

      rec.start();
      setRecState("recording");
      recTimerRef.current = window.setInterval(() => {
        setRecElapsed(Date.now() - recStartRef.current);
      }, 100);
      recStopTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, MAX_VOICE_MS);
    } catch {
      setRecState("idle");
      alert(s.errors.micDenied);
    }
  }, [pin, stopRecording, s]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recTimerRef.current !== null) window.clearInterval(recTimerRef.current);
      if (recStopTimeoutRef.current !== null) window.clearTimeout(recStopTimeoutRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try { recorderRef.current.stop(); } catch { /* noop */ }
      }
    };
  }, []);

  if (!hydrated) {
    return (
      <main style={pageStyle}>
        <div style={{ color: MUTED, fontSize: 14 }}>{s.home.loading}</div>
      </main>
    );
  }

  // ─── NO PIN STATE ────────────────────────────────────────────────────────
  if (!pin) {
    return (
      <main style={pageStyle}>
        <HiveInstallHint
          engineName={ENGINE_NAME}
          engineSlug={ENGINE_SLUG}
          customMessage={s.install.banner.home}
        />

        <header style={headerStyle}>
          <div style={brandStyle}>ParkBack</div>
          <div style={taglineStyle}>{s.home.tagline}</div>
        </header>

        {perm === "denied" || perm === "unavailable" ? (
          <div role="alert" style={alertStyle}>{permMessage}</div>
        ) : null}

        <HexButton
          variant="primary"
          size="lg"
          onClick={dropPin}
          busy={perm === "requesting"}
          ariaLabel={s.home.ctaParkedAria}
        >
          {perm === "requesting" ? s.home.ctaLocating : s.home.ctaParked}
        </HexButton>

        <div style={positioningBlockStyle}>
          <div style={positioningLine1Style}>{s.home.positioningLine1}</div>
          <div style={positioningLine2Style}>{s.home.positioningLine2}</div>
        </div>

        <HiveFirstVisitExplainer
          engineName={ENGINE_NAME}
          engineSlug={ENGINE_SLUG}
          customMessage={s.home.firstVisitExplainer}
        />

        <div style={hintStyle}>
          {perm === "requesting" ? s.home.hintRequesting : s.home.hintIdle}
        </div>

        <HiveFooter />
      </main>
    );
  }

  // ─── PIN SET STATE ───────────────────────────────────────────────────────
  const distance = here ? haversineMeters(here, pin) : null;
  const bearing = here ? bearingDegrees(here, pin) : null;
  // Arrow rotation: compass-relative if we have heading, otherwise north-up.
  const arrowRotation =
    bearing === null
      ? 0
      : compassState === "active" && compassHeading !== null
      ? (bearing - compassHeading + 360) % 360
      : bearing;
  const elapsedMs = now - pin.timestamp;
  const showPhotoPrompt = !pin.photo && !photoSkipped;
  const showVoicePrompt = !pin.voiceMemo && !voiceSkipped && recState === "idle";

  return (
    <main style={pageStyle}>
      <div style={elapsedStyle}>{formatElapsed(elapsedMs)}</div>

      <div style={compassWrapStyle}>
        <div style={compassRingStyle}>
          {compassState === "calibrating" ? (
            <Figure8 />
          ) : (
            <ArrowSvg rotation={arrowRotation} dim={bearing === null} />
          )}
        </div>
        <div style={distanceStyle}>{distance === null ? s.compass.locating : formatDistance(distance)}</div>
        {pin.landmark ? <div style={landmarkStyle}>{s.compass.near} {pin.landmark}</div> : null}
        {pin.accuracy ? (
          <div style={accuracyStyle}>±{Math.round(pin.accuracy)} {s.compass.accuracySuffix}</div>
        ) : null}
        {compassState === "needs-permission" ? (
          <button type="button" onClick={requestCompassPermission} style={smallButtonStyle}>
            {s.compass.enable}
          </button>
        ) : null}
        {compassState === "calibrating" ? (
          <div style={compassNoteStyle}>{s.compass.calibrating}</div>
        ) : compassState !== "active" ? (
          <div style={compassNoteStyle}>{s.compass.instruction}</div>
        ) : null}
      </div>

      {(pin.photo || pin.voiceMemo) ? (
        <div style={mediaRowStyle}>
          {pin.photo ? (
            <button
              type="button"
              onClick={() => setPhotoOpen(true)}
              aria-label={s.prompts.photoOpenAria}
              style={{ ...thumbLinkStyle, padding: 0, background: "transparent", cursor: "pointer" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pin.photo} alt={s.prompts.photoAlt} style={thumbStyle} />
            </button>
          ) : null}
          {pin.voiceMemo ? (
            <audio controls src={pin.voiceMemo} style={audioStyle} />
          ) : null}
        </div>
      ) : null}

      {photoOpen && pin.photo ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPhotoOpen(false)}
          style={photoModalStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pin.photo} alt={s.prompts.photoFullAlt} style={photoFullStyle} />
          <div style={photoCloseHintStyle}>{s.prompts.tapToClose}</div>
        </div>
      ) : null}

      {showPhotoPrompt ? (
        <div style={promptRowStyle}>
          <span style={promptTextStyle}>{s.prompts.photoQuestion}</span>
          <HexButton variant="ghost" size="md" onClick={handleTakePhoto} ariaLabel={s.prompts.photoTakeAria}>{s.prompts.photoTake}</HexButton>
          <button type="button" onClick={() => setPhotoSkipped(true)} style={skipLinkStyle}>{s.prompts.skip}</button>
        </div>
      ) : null}

      {showVoicePrompt ? (
        <div style={promptRowStyle}>
          <span style={promptTextStyle}>{s.prompts.voiceQuestion}</span>
          <HexButton variant="ghost" size="md" onClick={startRecording} ariaLabel={s.prompts.voiceRecordAria}>{s.prompts.voiceRecord}</HexButton>
          <button type="button" onClick={() => setVoiceSkipped(true)} style={skipLinkStyle}>{s.prompts.skip}</button>
        </div>
      ) : null}

      {recState === "recording" ? (
        <div style={promptRowStyle}>
          <span style={{ ...promptTextStyle, color: GOLD }}>
            {s.prompts.recordingPrefix} {Math.min(MAX_VOICE_MS, recElapsed) / 1000 | 0}s / {MAX_VOICE_MS / 1000}s
          </span>
          <button type="button" onClick={stopRecording} style={smallButtonStyle}>{s.prompts.stopRecording}</button>
        </div>
      ) : null}

      {recState === "saving" ? (
        <div style={promptRowStyle}>
          <span style={promptTextStyle}>{s.prompts.saving}</span>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        style={{ display: "none" }}
      />

      <div style={actionsRowStyle}>
        <HexButton variant="primary" size="md" onClick={handleNavigate} ariaLabel={s.actions.navigateAria}>{s.actions.navigate}</HexButton>
        <HexButton variant="ghost" size="md" onClick={handleShare} ariaLabel={s.actions.sendAria}>{s.actions.send}</HexButton>
        <HexButton variant="ghost" size="md" onClick={handleClear} ariaLabel={s.actions.forgetAria}>{s.actions.forget}</HexButton>
      </div>

      <HiveAHTSPrompt
        open={showA2HS}
        onDismiss={dismissA2HS}
        engineName={ENGINE_NAME}
        customMessage={s.install.ahtsCard.body}
      />

      <HiveFooter />

      {toast ? <div role="status" style={toastStyle}>{toast}</div> : null}
    </main>
  );
}

// ─── Inline SVG arrow ──────────────────────────────────────────────────────
function ArrowSvg({ rotation, dim }: { rotation: number; dim: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        opacity: dim ? 0.3 : 1,
      }}
      aria-hidden="true"
    >
      <polygon points="50,8 78,82 50,68 22,82" fill={GOLD} stroke={GOLD_DIM} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: `radial-gradient(circle at 50% 30%, #14110a 0%, ${INK} 70%)`,
  color: PAPER,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  // Top inset is owned by <HiveHeader/> (rendered above this main in the
  // root layout). A small 8px gap here gives breathing room between the
  // Hive logo and the engine's own brand block without stacking a second
  // safe-area inset.
  padding: "8px 20px max(env(safe-area-inset-bottom), 24px)",
  gap: 18,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  textAlign: "center",
  WebkitTapHighlightColor: "transparent",
};

const headerStyle: React.CSSProperties = {
  marginTop: 24,
  marginBottom: 16,
};

const brandStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: GOLD,
};

const taglineStyle: React.CSSProperties = {
  marginTop: 6,
  color: MUTED,
  fontSize: 14,
};

const hintStyle: React.CSSProperties = {
  marginTop: 24,
  color: MUTED,
  fontSize: 13,
  maxWidth: 280,
};

const alertStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(212, 175, 55, 0.08)",
  border: `1px solid ${GOLD_DIM}`,
  color: PAPER,
  fontSize: 14,
  maxWidth: 320,
};

const elapsedStyle: React.CSSProperties = {
  marginTop: 12,
  color: MUTED,
  fontSize: 13,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const compassWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  marginTop: 8,
};

const compassRingStyle: React.CSSProperties = {
  width: 200,
  height: 200,
  borderRadius: "50%",
  border: `2px solid ${GOLD_DIM}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 28,
  background: "rgba(212, 175, 55, 0.04)",
  boxShadow: "inset 0 0 30px rgba(212, 175, 55, 0.08)",
};

const distanceStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: GOLD,
  letterSpacing: "0.01em",
};

const landmarkStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 15,
  maxWidth: 320,
};

const accuracyStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 12,
};

const mediaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "center",
  width: "100%",
  maxWidth: 360,
};

const thumbLinkStyle: React.CSSProperties = {
  display: "block",
  borderRadius: 8,
  overflow: "hidden",
  border: `1px solid ${GOLD_DIM}`,
};

const thumbStyle: React.CSSProperties = {
  width: 72,
  height: 72,
  objectFit: "cover",
  display: "block",
};

const audioStyle: React.CSSProperties = {
  height: 36,
  flex: "1 1 200px",
  maxWidth: 260,
};

const promptRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "center",
  width: "100%",
  maxWidth: 360,
};

const promptTextStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 13,
};

const smallButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const skipLinkStyle: React.CSSProperties = {
  background: "transparent",
  color: MUTED,
  border: "none",
  fontSize: 13,
  cursor: "pointer",
  textDecoration: "underline",
  padding: 4,
};

const actionsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: "auto",
  paddingTop: 16,
  width: "100%",
  maxWidth: 360,
  justifyContent: "space-between",
  flexWrap: "wrap",
};

const positioningBlockStyle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 6,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  maxWidth: 380,
  padding: "0 12px",
  textAlign: "center",
  lineHeight: 1.5,
};

const positioningLine1Style: React.CSSProperties = {
  color: "#B89730",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.01em",
};

const positioningLine2Style: React.CSSProperties = {
  color: "#B89730",
  fontSize: 12,
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "0.01em",
};

const compassNoteStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 11,
  fontStyle: "italic",
  maxWidth: 240,
};

const photoModalStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.92)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: 16,
  cursor: "zoom-out",
};

const photoFullStyle: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "85vh",
  objectFit: "contain",
  borderRadius: 8,
  boxShadow: "0 0 60px rgba(212, 175, 55, 0.2)",
};

const photoCloseHintStyle: React.CSSProperties = {
  marginTop: 12,
  color: MUTED,
  fontSize: 12,
  letterSpacing: "0.05em",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "max(env(safe-area-inset-bottom), 24px)",
  left: "50%",
  transform: "translateX(-50%)",
  background: GOLD,
  color: INK,
  padding: "10px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.5)",
  zIndex: 60,
};
