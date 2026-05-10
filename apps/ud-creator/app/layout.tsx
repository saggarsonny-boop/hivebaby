import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "Hive Space Station | Founder Dashboard",
  description: "Central command and telemetry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="grid-bg"></div>
          <div className="container" style={{ maxWidth: '1400px' }}>
            <header className="navbar">
              <a href="/" className="logo">Space <span style={{ color: 'var(--foreground)' }}>Station</span></a>
              <div>
                <SignedIn><UserButton afterSignOutUrl="/"/></SignedIn>
                <SignedOut><a href="/sign-in" className="btn">Authenticate</a></SignedOut>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}