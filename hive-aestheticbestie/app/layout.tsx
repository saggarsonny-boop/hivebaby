import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HiveAestheticBestie",
  description: "Instant aesthetic reflection with best-friend warmth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-footer">
          <p>No ads. No investors. No agenda.</p>
          <p>Free at the base tier, forever.</p>
        </footer>
      </body>
    </html>
  );
}