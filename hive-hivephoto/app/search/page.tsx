'use client'

import { useState } from 'react'
import SearchBar from '@/components/search/SearchBar'
import type { SearchPhotoResult } from '@/components/search/SearchBar'

export default function SearchPage() {
  const [results, setResults] = useState<SearchPhotoResult[]>([])

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-amber-400">Search</h1>
      <SearchBar onResults={setResults} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {results.map((r) => (
          <a key={r.id} href={`/photo/${r.id}`} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <img src={r.thumbUrl} alt={r.aiTitle || 'Photo'} className="aspect-square w-full object-cover" />
          </a>
        ))}
      </div>
    </section>
  )
}
