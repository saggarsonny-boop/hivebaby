"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  bearingDegrees,
  formatDistance,
  formatElapsed,
  haversineMeters,
  navigateUrl,
  type LatLng,
} from "../_lib/geo";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

type SharedPin = {
  lat: number;
  lng: number;
  timestamp: number | null;
  landmark: string | null;
};

function parseSharedPin(params: URLSearchParams): SharedPin | null {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!isFinite(lat) || !isFinite(lng) || lat === 0 && lng === 0) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const tRaw = params.get("t");
  const t = tRaw ? Number(tRaw) : NaN;
  const landmark = params.get("landmark");
  return {
    lat,
    lng,
    timestamp: isFinite(t) ? t : null,
    landmark: landmark ? landmark.trim() : null,
  };
}

function FindInner() {
  const searchParams = useSearchParams();
  const [pin, setPin] = useState<SharedPin | null>(null);
  const [parseError, setParseError] = useState(false);
  const [here, setHere] = useState<LatLng | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [compassState, setCompassState] = useState<"idle" | "active" | "needs-permission" | "unavailable">("idle");
  const watchIdRef = useRef<number | null>(null);

  // Parse params
  useEffect(() => {
    const parsed = parseSharedPin(searchParams);
    if (!parsed) setParseError(true);
    else setPin(parsed);
  }, [searchParams]);

  // Tick elapsed every 15s
  useEffect(() => {
    if (!pin?.timestamp) return;
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, [pin?.timestamp]);

  // Watch current location
  useEffect(() => {
    if (!pin) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
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

  // Compass
  useEffect(() => {
    if (!pin) return;
    if (typeof window === "undefined") return;
    const W = window as any;

    const handler = (e: DeviceOrientationEvent) => {
      const wh = (e as any).webkitCompassHeading;
      let heading: number | null = null;
      if (typeof wh === "number" && !Number.isNaN(wh)) heading = wh;
      else if (typeof e.alpha === "number") heading = (360 - e.alpha) % 360;
      if (heading !== null) {
        setCompassHeading(heading);
        setCompassState("active");
      }
    };

    const supportsAbsolute = "ondeviceorientationabsolute" in window;
    const eventName = supportsAbsolute ? "deviceorientationabsolute" : "deviceorientation";
    const needsPermission =
      typeof W.DeviceOrientationEvent !== "undefined" &&
      typeof W.DeviceOrientationEvent.requestPermission === "function";

    if (needsPermission) {
      setCompassState((s) => (s === "active" ? s : "needs-permission"));
    } else if (typeof W.DeviceOrientationEvent !== "undefined") {
      window.addEventListener(eventName, handler as EventListener, true);
    } else {
      setCompassState("unavailable");
    }

    return () => {
      window.removeEventListener(eventName, handler as EventListener, true);
    };
  }, [pin]);

  const requestCompassPermission = useCallback(async () => {
    const W = window as any;
    if (typeof W.DeviceOrientationEvent?.requestPermission !== "function") return;
    try {
      const result = await W.DeviceOrientationEvent.requestPermission();
      if (result === "granted") {
        const handler = (e: DeviceOrientationEvent) => {
          const wh = (e as any).webkitCompassHeading;
          let heading: number | null = null;
          if (typeof wh === "number" && !Number.isNaN(wh)) heading = wh;
          else if (typeof e.alpha === "number") heading = (360 - e.alpha) % 360;
          if (heading !== null) {
            setCompassHeading(heading);
            setCompassState("active");
          }
        };
        window.addEventListener("deviceorientation", handler as EventListener, true);
      } else {
        setCompassState("unavailable");
      }
    } catch {
      setCompassState("unavailable");
    }
  }, []);

  const handleNavigate = useCallback(() => {
    if (!pin) return;
    window.location.href = navigateUrl({ lat: pin.lat, lng: pin.lng });
  }, [pin]);

  if (parseError) {
    return (
      <main style={pageStyle}>
        <header style={headerStyle}>
          <div style={brandStyle}>ParkBack</div>
          <div style={taglineStyle}>This link doesn't look right.</div>
        </header>
        <p style={{ color: MUTED, maxWidth: 320, fontSize: 14 }}>
          The shared link is missing or invalid coordinates. Ask the person who sent it to share again.
        </p>
        <a href="/" style={primaryActionStyle}>Open ParkBack</a>
      </main>
    );
  }

  if (!pin) {
    return (
      <main style={pageStyle}>
        <div style={{ color: MUTED, fontSize: 14 }}>Loading…</div>
      </main>
    );
  }

  const distance = here ? haversineMeters(here, { lat: pin.lat, lng: pin.lng }) : null;
  const bearing = here ? bearingDegrees(here, { lat: pin.lat, lng: pin.lng }) : null;
  const arrowRotation =
    bearing === null
      ? 0
      : compassState === "active" && compassHeading !== null
      ? (bearing - compassHeading + 360) % 360
      : bearing;
  const elapsedMs = pin.timestamp ? now - pin.timestamp : null;

  return (
    <main style={pageStyle}>
      <header style={sharedHeaderStyle}>
        <div style={brandStyle}>ParkBack</div>
        <div style={sharedTitleStyle}>Someone shared their parking spot with you.</div>
      </header>

      {elapsedMs !== null ? <div style={elapsedStyle}>{formatElapsed(elapsedMs)}</div> : null}

      <div style={compassWrapStyle}>
        <div style={compassRingStyle}>
          <ArrowSvg rotation={arrowRotation} dim={bearing === null} />
        </div>
        <div style={distanceStyle}>{distance === null ? "Locating you…" : formatDistance(distance)}</div>
        {pin.landmark ? <div style={landmarkStyle}>near {pin.landmark}</div> : null}
        {compassState === "needs-permission" ? (
          <button type="button" onClick={requestCompassPermission} style={smallButtonStyle}>Enable compass</button>
        ) : null}
        {compassState !== "active" ? (
          <div style={compassNoteStyle}>Hold phone flat, arrow points to car.</div>
        ) : null}
      </div>

      <div style={actionsRowStyle}>
        <button type="button" onClick={handleNavigate} style={primaryActionStyle}>Navigate</button>
      </div>

      <footer style={footerStyle}>No ads. No investors. No agenda.</footer>
    </main>
  );
}

export default function FindPage() {
  return (
    <Suspense fallback={<main style={pageStyle}><div style={{ color: MUTED }}>Loading…</div></main>}>
      <FindInner />
    </Suspense>
  );
}

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

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: `radial-gradient(circle at 50% 30%, #14110a 0%, ${INK} 70%)`,
  color: PAPER,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "max(env(safe-area-inset-top), 24px) 20px max(env(safe-area-inset-bottom), 24px)",
  gap: 16,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  textAlign: "center",
  WebkitTapHighlightColor: "transparent",
};

const headerStyle: React.CSSProperties = { marginTop: 24 };
const sharedHeaderStyle: React.CSSProperties = { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 };
const brandStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: GOLD, letterSpacing: "0.02em" };
const sharedTitleStyle: React.CSSProperties = { color: PAPER, fontSize: 15, maxWidth: 320 };
const taglineStyle: React.CSSProperties = { marginTop: 6, color: MUTED, fontSize: 14 };
const elapsedStyle: React.CSSProperties = { color: MUTED, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" };
const compassWrapStyle: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 4 };
const compassRingStyle: React.CSSProperties = {
  width: 200, height: 200, borderRadius: "50%", border: `2px solid ${GOLD_DIM}`,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 28,
  background: "rgba(212, 175, 55, 0.04)", boxShadow: "inset 0 0 30px rgba(212, 175, 55, 0.08)",
};
const distanceStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, color: GOLD };
const landmarkStyle: React.CSSProperties = { color: PAPER, fontSize: 15, maxWidth: 320 };
const compassNoteStyle: React.CSSProperties = { color: MUTED, fontSize: 11, fontStyle: "italic", maxWidth: 240 };
const actionsRowStyle: React.CSSProperties = {
  display: "flex", gap: 10, marginTop: "auto", paddingTop: 16, width: "100%", maxWidth: 360, justifyContent: "center",
};
const primaryActionStyle: React.CSSProperties = {
  background: GOLD, color: INK, border: "none", borderRadius: 10,
  padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none",
  display: "inline-block",
};
const smallButtonStyle: React.CSSProperties = {
  background: "transparent", color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8,
  padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const footerStyle: React.CSSProperties = { marginTop: 18, color: MUTED, fontSize: 11, letterSpacing: "0.05em" };
