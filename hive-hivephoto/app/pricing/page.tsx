import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { PricingTable } from '@/components/pricing/PricingTable'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, honest pricing</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Free forever at the base tier. Founding tiers lock in your price permanently.
          </p>
        </div>
        <PricingTable />
      </main>
      <Footer />
    </div>
  )
}
