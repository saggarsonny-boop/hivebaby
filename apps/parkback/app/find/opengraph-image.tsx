import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Find my parking spot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

function formatElapsedShort(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  const mr = m % 60;
  return mr ? `${h}h ${mr}m ago` : `${h}h ago`;
}

export default async function Image({ searchParams }: { searchParams?: Record<string, string> }) {
  const params = searchParams || {};
  const landmark = params.landmark?.trim() || null;
  const tRaw = params.t;
  const t = tRaw ? Number(tRaw) : NaN;
  const elapsed = isFinite(t) ? formatElapsedShort(Date.now() - t) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#000",
          color: PAPER,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Mark on the left */}
        <div
          style={{
            width: 480,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.18) 0%, rgba(0,0,0,0) 70%)",
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 110,
              border: `4px solid ${GOLD_DIM}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,175,55,0.06)",
            }}
          >
            <div style={{ fontSize: 120, fontWeight: 800, color: GOLD, lineHeight: 1 }}>P</div>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px 60px 0",
            gap: 14,
          }}
        >
          <div style={{ fontSize: 28, color: GOLD, fontWeight: 700, letterSpacing: 1 }}>
            ParkBack
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, color: PAPER }}>
            Find my parking spot
          </div>
          {landmark ? (
            <div style={{ fontSize: 30, color: PAPER, marginTop: 8 }}>near {landmark}</div>
          ) : null}
          {elapsed ? (
            <div style={{ fontSize: 24, color: MUTED, marginTop: 4 }}>parked {elapsed}</div>
          ) : null}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              color: MUTED,
              borderTop: `1px solid ${GOLD_DIM}`,
              paddingTop: 16,
            }}
          >
            <div style={{ color: GOLD }}>parkback.hive.baby</div>
            <div>No ads. No agenda.</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
