// Privacy-respecting event tracking via Plausible.
// No cookies, no IP storage, no PII. Server-side at plausible.io aggregates
// counts only.

type Plausible = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

export type EventName =
  | "pin_dropped"
  | "photo_taken"
  | "voice_memo_recorded"
  | "share_link_generated"
  | "find_view_loaded";

export function track(event: EventName, props?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Silent — analytics never break the app.
  }
}
