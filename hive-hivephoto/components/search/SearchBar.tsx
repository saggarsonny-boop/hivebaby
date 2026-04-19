'use client'

import { useState } from 'react'

export interface SearchPhotoResult {
  id: string
  thumbUrl: string
  aiTitle?: string | null
}

export default function SearchBar({ onResults }: { onResults: (results: SearchPhotoResult[]) => void }) {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  async function runSearch() {
    setBusy(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json() as Promise<{ results?: SearchPhotoResult[] }>)
    onResults(res.results || [])
    setBusy(false)
  }

  return (
    <div className="flex gap-2">
      <input value={q} onChange={e => setQ(e.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100" placeholder="Search: 'beach sunset with dad 2022'" />
      <button onClick={runSearch} disabled={busy} className="rounded bg-amber-500 px-4 py-2 text-zinc-950">Search</button>
    </div>
  )
}
