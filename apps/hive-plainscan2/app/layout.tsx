import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hivePlainscan",
  description: "Plain-English imaging report explanations for patients."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

