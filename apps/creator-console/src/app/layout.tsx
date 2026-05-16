import './globals.css'
import type { Metadata } from 'next'
import { Hexagon, Activity, DollarSign, Globe, Settings, Terminal } from 'lucide-react'

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
            <div className="brand">
              <Hexagon size={28} color="var(--gold-primary)" strokeWidth={2.5} />
              HIVE COMMAND
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#" className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--gold-primary)', background: 'var(--gold-faded)' }}>
                <Activity size={18} /> Overview
              </a>
              <a href="#" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <Terminal size={18} /> Engines (252)
              </a>
              <a href="#" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <DollarSign size={18} /> Revenue
              </a>
              <a href="#" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <Globe size={18} /> Demographics
              </a>
              <div style={{ marginTop: 'auto' }}>
                <a href="#" className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%' }}>
                  <Settings size={18} /> Settings
                </a>
              </div>
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
