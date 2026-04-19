import Link from 'next/link'

export default function AccountPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold text-amber-400">Account</h1>
      <Link className="inline-block rounded bg-zinc-800 px-3 py-2" href="/account/billing">Billing</Link>
      <Link className="ml-2 inline-block rounded bg-zinc-800 px-3 py-2" href="/account/storage">Storage</Link>
    </section>
  )
}
