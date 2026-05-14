import HiveOpsWidget from '@/components/HiveOpsWidget';
import { ClerkProvider } from '@clerk/nextjs'
export const metadata = {
  title: 'HIVE-KIT - Universal Document Ecosystem',
  description: 'Powered by the Hive Queen Bee architecture. Built for MACHINE_OVER_HUMAN compliance.',
  openGraph: { title: 'HIVE-KIT' }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="machine-over-human"><ClerkProvider>{children}</ClerkProvider>  <HiveOpsWidget />
      </body>
    </html>
  )
}