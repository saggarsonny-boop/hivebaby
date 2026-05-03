import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://parkback.hive.baby";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "ParkBack — find your car",
  description: "Drop a pin where you parked. Walk back to it. No accounts, no servers, no tracking.",
  applicationName: "ParkBack",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ParkBack",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: appUrl,
    title: "ParkBack — find your car",
    description: "Drop a pin where you parked. Walk back to it.",
    siteName: "ParkBack",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#f5f1e6",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: "antialiased",
          minHeight: "100dvh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
