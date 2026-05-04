import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://parkback.hive.baby";
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "parkback.hive.baby";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "ParkBack — never lose your car again",
  description:
    "Tap once when you park. Tap again to find your car. No app, no signup, works offline. Free forever.",
  applicationName: "ParkBack",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
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
    url: APP_URL,
    siteName: "ParkBack",
    title: "ParkBack — never lose your car again",
    description:
      "Tap once when you park. Tap again to find your car. No app, no signup, works offline. Free forever.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ParkBack — never lose your car again",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ParkBack — never lose your car again",
    description:
      "Tap once when you park. Tap again to find your car. No app, no signup, works offline. Free forever.",
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

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ParkBack",
  description:
    "Tap once when you park. Tap again to find your car. No app, no signup, works offline. Free forever.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  url: APP_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Hive",
    url: "https://hive.baby",
  },
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
        <ServiceWorkerRegistrar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
        />
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
        </Script>
      </body>
    </html>
  );
}
