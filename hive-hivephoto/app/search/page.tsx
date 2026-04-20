'use client'
import { useState } from 'react'
import { Nav } from '@/components/layout/Nav'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFiltersDisplay } from '@/components/search/SearchFiltersDisplay'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Photo } from '@/lib/types/photo'
import type { SearchFilters } from '@/lib/types/search'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filters, setFilters] = useState<SearchFilters>({})
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(q: string) {
    setQuery(q)
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = (await res.json()) as { photos: Photo[]; filters: SearchFilters }
      setPhotos(data.photos ?? [])
      setFilters(data.filters ?? {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search Photos</h1>
        <SearchBar onSearch={handleSearch} loading={loading} />
        {hasSearched && <SearchFiltersDisplay filters={filters} />}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && hasSearched && photos.length === 0 && (
          <EmptyState title="No results" description={`No photos matched "${query}"`} />
        )}
        {!loading && photos.length > 0 && <GalleryGrid photos={photos} />}
      </main>
    </div>
  )
}
