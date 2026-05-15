import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Creator Console | The Hive',
  description: 'Central Intelligence and Telemetry Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body>
        <div className="dashboard-container">
          <aside className="sidebar">
            <div className="brand">HIVE COMMAND</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="#" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 500 }}>Overview</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Engines (252)</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Revenue</a>
              <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Demographics</a>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
