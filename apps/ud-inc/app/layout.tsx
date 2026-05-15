import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universal Document™ — the document substrate of the Hive",
  description:
    "Universal Document™ (UD) is a document substrate for the post-PDF era — open, governed, machine-readable, sealed when it needs to be. The Hive ecosystem.",
  metadataBase: new URL("https://universaldocument.hive.baby"),
  openGraph: {
    title: "Universal Document™ — the document substrate of the Hive",
    description:
      "Open, governed, machine-readable documents. UDR for revisable. UDS for sealed.",
    url: "https://universaldocument.hive.baby",
    siteName: "Universal Document",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "Universal Document",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#c8960a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="navbar">
            <a href="/" className="logo">
              Universal Document<span className="tm">™</span>
            </a>
            <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.9rem" }}>
              <a href="#what">What is UD</a>
              <a href="#tools">Tools</a>
              <a href="#pricing">Pricing</a>
              <a
                href="https://hive.baby"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hive
              </a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
        <footer className="hive-footer-signature">
          <div>
            Made with <span className="heart">♥</span> in{" "}
            <a
              href="https://hive.baby"
              target="_blank"
              rel="noopener noreferrer"
            >
              the Hive
            </a>
            .
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
            No ads. No investors. No agenda. Universal Document™ is a pending
            trademark of Universal Document Incorporated (Serial 99774346).
          </div>
        </footer>
      </body>
    </html>
  );
}
