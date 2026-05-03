import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ParkBack — find your car",
  description: "Drop a pin where you parked. Walk back to it. No accounts, no servers, no tracking.",
  applicationName: "ParkBack",
  manifest: "/parkback/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ParkBack",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/parkback/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/parkback/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/parkback/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function ParkBackLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
