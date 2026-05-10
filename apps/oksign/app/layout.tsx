import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "OKSign",
  description: "The fastest way to get anything signed. One tap. Zero friction.",
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
            <header className="header">
              <a href="/" className="logo">OKSign</a>
              <div>
                <SignedIn>
                  <UserButton afterSignOutUrl="/"/>
                </SignedIn>
                <SignedOut>
                  <a href="/sign-in" className="btn btn-outline">Sign In</a>
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
