'use client'
import { useState } from 'react'

const PLACEHOLDERS = [
  'Photos of my dog at the beach',
  'Birthday party 2023',
  'Sunset photos from last summer',
  'Photos with John smiling',
  'Mountain hike photos',
  'Food photos from Italy',
]

interface Props {
  onSearch: (query: string) => void
  loading?: boolean
}

export function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('')
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={PLACEHOLDERS[placeholderIdx]}
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Search'}
      </button>
    </form>
  )
}
