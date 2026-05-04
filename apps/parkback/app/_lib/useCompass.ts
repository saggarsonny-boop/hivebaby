"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CompassState =
  | "idle"           // not started
  | "needs-permission" // iOS 13+ awaiting requestPermission user gesture
  | "calibrating"    // permission granted, waiting for stable readings
  | "active"         // events flowing reliably
  | "unavailable";   // device or browser doesn't support orientation

// How many events we need before we trust the reading.
const READY_THRESHOLD = 5;

function readHeading(e: DeviceOrientationEvent): { heading: number | null; accuracy: number | null } {
  const wh = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  const wa = (e as DeviceOrientationEvent & { webkitCompassAccuracy?: number }).webkitCompassAccuracy;
  let heading: number | null = null;
  let accuracy: number | null = null;
  if (typeof wh === "number" && !Number.isNaN(wh)) {
    heading = wh;
    if (typeof wa === "number") accuracy = wa;
  } else if (typeof e.alpha === "number" && !Number.isNaN(e.alpha)) {
    heading = (360 - e.alpha) % 360;
  }
  return { heading, accuracy };
}

export function useCompass(enabled: boolean) {
  const [state, setState] = useState<CompassState>("idle");
  const [heading, setHeading] = useState<number | null>(null);
  const eventCountRef = useRef(0);
  const lastAccuracyRef = useRef<number | null>(null);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const attachListener = useCallback(() => {
    if (typeof window === "undefined") return;
    const supportsAbsolute = "ondeviceorientationabsolute" in window;
    const eventName = supportsAbsolute ? "deviceorientationabsolute" : "deviceorientation";

    const handler = (e: DeviceOrientationEvent) => {
      const { heading: h, accuracy } = readHeading(e);
      if (h === null) return;
      eventCountRef.current += 1;
      lastAccuracyRef.current = accuracy;
      setHeading(h);
      // Consider compass "active" once we've seen enough events and accuracy
      // is reasonable (or unknown — non-iOS browsers don't report it).
      const accuracyOk = accuracy === null || accuracy < 50;
      if (eventCountRef.current >= READY_THRESHOLD && accuracyOk) {
        setState("active");
      } else {
        setState("calibrating");
      }
    };
    handlerRef.current = handler;
    window.addEventListener(eventName, handler as EventListener, true);
    return () => {
      window.removeEventListener(eventName, handler as EventListener, true);
      handlerRef.current = null;
    };
  }, []);

  // Initial setup — decide what state to show.
  useEffect(() => {
    if (!enabled) {
      setState("idle");
      setHeading(null);
      eventCountRef.current = 0;
      lastAccuracyRef.current = null;
      return;
    }
    if (typeof window === "undefined") return;
    const W = window as Window & {
      DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    };

    const needsPermission =
      typeof W.DeviceOrientationEvent !== "undefined" &&
      typeof W.DeviceOrientationEvent.requestPermission === "function";

    if (needsPermission) {
      setState("needs-permission");
      return;
    }
    if (typeof W.DeviceOrientationEvent === "undefined") {
      setState("unavailable");
      return;
    }
    // Non-iOS path — start listening immediately. Will report "calibrating"
    // until enough events arrive.
    setState("calibrating");
    return attachListener();
  }, [enabled, attachListener]);

  // Auto-request permission on first user gesture (iOS) when enabled.
  useEffect(() => {
    if (!enabled || state !== "needs-permission") return;
    if (typeof window === "undefined") return;
    const W = window as Window & {
      DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    };
    if (typeof W.DeviceOrientationEvent?.requestPermission !== "function") return;

    const trigger = async () => {
      try {
        const result = await W.DeviceOrientationEvent!.requestPermission!();
        if (result === "granted") {
          setState("calibrating");
          attachListener();
        } else {
          setState("unavailable");
        }
      } catch {
        // If the gesture wasn't trusted, leave state as needs-permission so
        // the user can tap the explicit button.
      }
    };

    const onGesture = () => {
      trigger();
      document.removeEventListener("touchend", onGesture);
      document.removeEventListener("click", onGesture);
    };
    document.addEventListener("touchend", onGesture, { once: true });
    document.addEventListener("click", onGesture, { once: true });
    return () => {
      document.removeEventListener("touchend", onGesture);
      document.removeEventListener("click", onGesture);
    };
  }, [enabled, state, attachListener]);

  // Manual permission request (for the "Enable compass" button).
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return;
    const W = window as Window & {
      DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    };
    if (typeof W.DeviceOrientationEvent?.requestPermission !== "function") {
      setState("unavailable");
      return;
    }
    try {
      const result = await W.DeviceOrientationEvent.requestPermission();
      if (result === "granted") {
        setState("calibrating");
        attachListener();
      } else {
        setState("unavailable");
      }
    } catch {
      setState("unavailable");
    }
  }, [attachListener]);

  return { state, heading, requestPermission };
}
