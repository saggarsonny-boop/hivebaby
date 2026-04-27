import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://plainscan.hive.baby";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "HivePlainScan - Radiology Report Explained in Plain English",
  description:
    "Upload your radiology report and get a clear plain-English explanation, a visual summary, questions for your doctor, and a downloadable PDF. No diagnosis. No jargon.",
  applicationName: "HivePlainScan",
  keywords: [
    "radiology report",
    "MRI explained",
    "CT scan explained",
    "patient education",
    "plain english",
    "Hive",
  ],
  authors: [{ name: "Hive" }],
  openGraph: {
    type: "website",
    url: appUrl,
    title: "HivePlainScan - Radiology Report Explained in Plain English",
    description:
      "Upload your radiology report and get a clear plain-English explanation, questions for your doctor, and a downloadable PDF.",
    siteName: "HivePlainScan",
  },
  twitter: {
    card: "summary_large_image",
    title: "HivePlainScan - Radiology Report Explained in Plain English",
    description:
      "Upload your radiology report and get a clear plain-English explanation.",
  },
  robots: { index: true, follow: true },
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
          <p>This is not medical advice. Always consult a qualified clinician.</p>
        </footer>
      </body>
    </html>
  );
}
