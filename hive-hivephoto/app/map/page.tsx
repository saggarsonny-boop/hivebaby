'use client'
import { useEffect, useState } from 'react'
import { Nav } from '@/components/layout/Nav'
import { MapView } from '@/components/map/MapView'
import type { Photo } from '@/lib/types/photo'

export default function MapPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all photos and filter client-side for those with GPS
    fetch('/api/photos?limit=1000')
      .then((r) => r.json())
      .then((data: { photos: Photo[] }) => {
        setPhotos((data.photos ?? []).filter((p) => p.gpsLat != null && p.gpsLng != null))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Photo Map</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {loading ? 'Loading...' : `${photos.length} geotagged photos`}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-zinc-800 h-[600px]">
            <MapView photos={photos} />
          </div>
        )}
      </main>
    </div>
  )
}
