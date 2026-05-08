import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";
import { HiveHeader } from "./_lib/HiveHeader";
import { HiveFooter } from "./_lib/HiveFooter";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hiveaestheticbestie.hive.baby";

// Canonical title format per HIVE_ENGINE_FINALIZATION_CHECKLIST.md
// TAB_TITLE_DESCRIPTIVE: "[Engine name] — [tagline]".
const TITLE = "HiveAestheticBestie — Instant aesthetic label, palette, and vibe card";
const DESCRIPTION = "Instant aesthetic reflection with best-friend warmth. Drop a selfie or a vibe in plain words; get back a label, a palette, and an outfit cue.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveAestheticBestie",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveAestheticBestie",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "HiveAestheticBestie",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
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
      <head>
        {/* Hive canonical: the engine sits inside the dark Hive palette
            for the system surface. ink #0a0a0a — #D4AF37 gold accents. */}
      </head>
      <body>
        <HiveHeader />
        {children}
        <HiveFooter />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
