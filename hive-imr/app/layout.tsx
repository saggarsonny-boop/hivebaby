import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hiveimr.hive.baby";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "HiveIMR — Intelligent Medical Records",
  description:
    "The post-EMR substrate. Role-aware, AI-native, patient-centred records for clinicians, ED, nursing, and allied health.",
  applicationName: "HiveIMR",
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
    url: appUrl,
    title: "HiveIMR — Intelligent Medical Records",
    description:
      "The post-EMR substrate. Role-aware, AI-native, patient-centred.",
    siteName: "HiveIMR",
  },
  twitter: {
    card: "summary_large_image",
    title: "HiveIMR — Intelligent Medical Records",
    description:
      "The post-EMR substrate. Role-aware, AI-native, patient-centred.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <footer className="site-footer">
          <p>No ads. No investors. No agenda.</p>
          <p>Free at the base tier, forever.</p>
          <p className="disclaimer">
            This is not medical advice. Always consult a qualified clinician.
          </p>
        </footer>
      </body>
    </html>
  );
}
