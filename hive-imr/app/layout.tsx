import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";
import { HiveHeader } from "./_lib/HiveHeader";
import { HiveFooter } from "./_lib/HiveFooter";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hiveimr.hive.baby";

// Canonical title format per HIVE_ENGINE_FINALIZATION_CHECKLIST.md
// TAB_TITLE_DESCRIPTIVE: "[Engine name] — [tagline]".
const TITLE = "HiveIMR — Intelligent Medical Records";
const DESCRIPTION = "The post-EMR substrate. Role-aware, AI-native, patient-centred records for clinicians, ED, nursing, and allied health.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveIMR",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveIMR",
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
  keywords: [
    "IMR",
    "EMR",
    "EHR",
    "intelligent medical records",
    "clinical AI",
    "handoff",
    "discharge summary",
    "Hive",
  ],
  authors: [{ name: "Hive" }],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "HiveIMR",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <HiveHeader />
        {children}
        <HiveFooter />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
