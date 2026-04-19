'use client'

import { useEffect, useState } from 'react'

interface DuplicatePhoto {
  id: string
  thumbUrl: string
}

interface DuplicateItem {
  photo: DuplicatePhoto
  original: DuplicatePhoto | null
}

export default function DuplicatesPage() {
  const [items, setItems] = useState<DuplicateItem[]>([])

  useEffect(() => {
    fetch('/api/duplicates')
      .then(r => r.json() as Promise<{ duplicates?: DuplicateItem[] }>)
      .then(d => setItems(d.duplicates || []))
  }, [])

  async function action(id: string, mode: 'keep-new' | 'keep-original' | 'keep-both') {
    await fetch(`/api/duplicates/${id}/${mode}`, { method: 'POST' })
    setItems(prev => prev.filter(i => i.photo.id !== id))
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-amber-400">Duplicate Review</h1>
      {items.length === 0 && <p className="text-zinc-400">No pending near-duplicates.</p>}
      {items.map((item) => (
        <article key={item.photo.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <img src={item.photo.thumbUrl} className="aspect-square w-full rounded object-cover" alt="candidate" />
            {item.original ? <img src={item.original.thumbUrl} className="aspect-square w-full rounded object-cover" alt="original" /> : <div className="rounded border border-dashed border-zinc-700" />}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-amber-500 px-3 py-1 text-zinc-950" onClick={() => action(item.photo.id, 'keep-new')}>Keep New</button>
            <button className="rounded bg-zinc-700 px-3 py-1" onClick={() => action(item.photo.id, 'keep-original')}>Keep Original</button>
            <button className="rounded bg-zinc-700 px-3 py-1" onClick={() => action(item.photo.id, 'keep-both')}>Keep Both</button>
          </div>
        </article>
      ))}
    </section>
  )
}
