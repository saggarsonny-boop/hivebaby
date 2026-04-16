import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Hive — Free tools for everyone',
  description: 'Hive builds free, beautiful, AI-powered tools for the community. Free forever at the base tier.',
}

export const viewport: Viewport = {
  themeColor: '#060a14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0, padding:0, background:'#060a14', color:'#e8f4ff', fontFamily:'system-ui, sans-serif'}}>
        {children}
      </body>
    </html>
  )
}
