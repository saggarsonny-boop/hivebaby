import { ClerkProvider } from "@clerk/nextjs";
// HIVE_FOOTER_SIGNATURE: "Made with ♥ in the Hive" rendered by HiveFooter
// below. Canonical Hive ink (#0a0a0a) used in app/globals.css.

import type { Metadata, Viewport } from "next";
import HiveFooter from "@/components/HiveFooter";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contract.hive.baby";
const TITLE = "HiveContract — Enterprise Legal Risk & IP Analysis";
const DESCRIPTION = "Upload vendor agreements and NDAs for instant liability, risk, and non-standard clause analysis.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveContract",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveContract",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "HiveContract",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ClerkProvider>
        <DisclaimerModal />
        {children}
        <footer className="site-footer">
          <p>No ads. No investors. No agenda.</p>
          <p>Free at the base tier, forever.</p>
          <p>This tool does not constitute legal advice. Always consult an attorney.</p>
          <HiveFooter />
        </footer>
        <ServiceWorkerRegistrar />
        </ClerkProvider>
      </body>
    </html>
  );
}

