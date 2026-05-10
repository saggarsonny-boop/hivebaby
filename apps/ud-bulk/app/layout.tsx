import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "UD Bulk | Enterprise Dropzone",
  description: "Secure bulk ingestion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-bg"></div>
        <div className="container">
          <header className="navbar">
            <a href="/" className="logo">UD<span>Bulk</span></a>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
