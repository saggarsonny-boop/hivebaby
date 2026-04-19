'use client'

import MapView from '@/components/map/MapView'

export default function MapPage() {
  const points = [] as Array<{ id: string; lat: number; lng: number; label: string }>
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-amber-400">Photo Map</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <MapView points={points} />
      </div>
    </section>
  )
}
