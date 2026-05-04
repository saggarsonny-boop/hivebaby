"use client";

import { useEffect } from "react";

// Must match CACHE_NAME in /public/sw.js. Bump both together when the SW
// changes in a way that should force a one-time client reload.
const ACTIVE_CACHE = "parkback-shell-v3";
const RELOAD_GATE_KEY = `parkback_sw_reloaded_for_${ACTIVE_CACHE}`;

// Renders nothing. Subscribes to "SW_ACTIVATED" messages from the service
// worker; when a new SW takes over a client that's currently displaying a
// stale precached app shell, this triggers a one-time reload so the user
// sees the fresh build immediately. SessionStorage gates against any
// possibility of a reload loop.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== "SW_ACTIVATED") return;
      if (e.data?.cache !== ACTIVE_CACHE) return;
      try {
        if (window.sessionStorage.getItem(RELOAD_GATE_KEY) === "1") return;
        window.sessionStorage.setItem(RELOAD_GATE_KEY, "1");
      } catch {
        // sessionStorage disabled — skip the reload rather than risk a loop.
        return;
      }
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  return null;
}
