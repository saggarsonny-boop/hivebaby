import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'HivePhoto',
  description: 'You are the investor. Your memories, searchable forever.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
