import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "COM-NAV | Sovereign Tactical",
  description: "Real-time clarity for high-stakes conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">COM-NAV</a>
              <div>
                <SignedIn>
                  <UserButton afterSignOutUrl="/"/>
                </SignedIn>
                <SignedOut>
                  <a href="/sign-in" className="btn">Authenticate</a>
                </SignedOut>
              </div>
            </header>
            <main>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
