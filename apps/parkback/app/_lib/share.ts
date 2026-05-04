// Build the share URL for a parked spot. UTM parameters track the viral loop
// without identifying any user.

export type ShareInput = {
  lat: number;
  lng: number;
  timestamp: number;
  landmark: string | null;
};

const SHARE_BASE = "https://parkback.hive.baby/find";

export function buildShareUrl(input: ShareInput): string {
  const params = new URLSearchParams({
    lat: String(input.lat),
    lng: String(input.lng),
    t: String(input.timestamp),
    utm_source: "share",
    utm_medium: "link",
  });
  if (input.landmark) params.set("landmark", input.landmark);
  return `${SHARE_BASE}?${params.toString()}`;
}

// The "back to parkback" recipient link inside /find.
export function recipientHomeUrl(): string {
  return "https://parkback.hive.baby/?utm_source=shared_recipient";
}
