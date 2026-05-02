import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gary Gansson — Everyone has a story worth telling',
  description: 'Gary Gansson is an AI talk show host on HiveTV. Share your story and Gary might read it on the next episode.',
  openGraph: {
    title: 'Gary Gansson — HiveTV',
    description: 'Everyone has a story worth telling.',
    url: 'https://gary.hive.baby',
    siteName: 'Gary Gansson',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
