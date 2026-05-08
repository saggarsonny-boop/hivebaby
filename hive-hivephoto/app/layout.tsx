import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";
import { HiveHeader } from "./_lib/HiveHeader";
import { HiveFooter } from "./_lib/HiveFooter";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hivephoto.hive.baby";

// Canonical title format per HIVE_ENGINE_FINALIZATION_CHECKLIST.md
// TAB_TITLE_DESCRIPTIVE: "[Engine name] — [tagline]".
const TITLE = "HivePhoto — AI photo intelligence";
const DESCRIPTION = "Your private AI-powered photo library. Smart search, automatic tagging, face recognition, duplicate detection. No ads. No investors. No agenda.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HivePhoto",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HivePhoto",
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
    siteName: "HivePhoto",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen antialiased">
          <HiveHeader />
          {children}
          <HiveFooter />
          <ServiceWorkerRegistrar />
        </body>
      </html>
    </ClerkProvider>
  );
}
