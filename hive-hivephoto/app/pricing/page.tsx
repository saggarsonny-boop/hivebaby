import Link from 'next/link'

export default function PricingPage() {
  const tiers = [
    { name: 'Hive Free', price: '$0 forever', storage: '50GB', note: 'No card, no trial' },
    { name: 'Founding Patron', price: '$3.99/mo', storage: '2TB', note: 'First 1,000 only' },
    { name: 'Hive Patron', price: '$4.99/mo or $47.88/yr', storage: '2TB', note: 'After founding closes' },
    { name: 'Founding Sovereign', price: '$9.99/mo', storage: 'Unlimited', note: 'First 500 only' },
    { name: 'Hive Sovereign', price: '$12.99/mo or $116.88/yr', storage: 'Unlimited', note: 'After founding closes' },
  ]

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-semibold text-amber-400">Pricing</h1>
      <p className="rounded-lg border border-amber-700/50 bg-zinc-900 p-3 text-sm text-amber-100">Governance rule: photos are never deleted or held hostage after downgrade.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map(t => (
          <article key={t.name} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-xl text-zinc-100">{t.name}</h2>
            <p className="mt-1 text-amber-400">{t.price}</p>
            <p className="text-zinc-300">Storage: {t.storage}</p>
            <p className="text-sm text-zinc-500">{t.note}</p>
          </article>
        ))}
      </div>
      <Link href="/account/billing" className="inline-block rounded bg-amber-500 px-4 py-2 text-zinc-950">Manage Billing</Link>
    </section>
  )
}
