// HIVE_FOOTER_SIGNATURE: "Made with ♥ in the Hive" rendered by HiveFooter.
// Canonical Hive ink (#0a0a0a) used in app/globals.css.

import type { Metadata, Viewport } from "next";
import HiveFooter from "@/components/HiveFooter";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vitality.hive.baby";

const TITLE = "HiveVitality — Fifteen minutes a day. Reps that grow with you.";
const DESCRIPTION =
  "A daily fifteen-minute mobility ritual. Tibetan Rites plus balance plus a deep squat plus a hinge plus bridges plus a plank plus sumo squats. Reps grow from three to twenty-one over ten weeks. Free, forever.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveVitality",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveVitality",
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
    title: TITLE,
    description: DESCRIPTION,
    siteName: "HiveVitality",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <footer className="site-footer">
          <p>No ads. No investors. No agenda.</p>
          <p>Free at the base tier, forever.</p>
          <p>This is not medical advice. Always consult a qualified clinician.</p>
          <HiveFooter />
        </footer>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
