import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HiveHeader } from "@/components/HiveHeader";
import { HiveFooter } from "@/components/HiveFooter";

const APP_URL = "https://hivebuystuff.hive.baby";
const TITLE = "HiveBuyStuff — Build once. Buy anywhere.";
const DESCRIPTION =
  "Save your shopping lists once, run them on Walmart, Target, Amazon, Instacart, or Kroger. AI maps your items to real products with your brand tier, dietary rules, and substitution preferences applied automatically.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveBuyStuff",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveBuyStuff",
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
  authors: [{ name: "Hive" }],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "HiveBuyStuff",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
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
    <html lang="en">
      <body>
        <HiveHeader />
        {children}
        <HiveFooter />
      </body>
    </html>
  );
}
