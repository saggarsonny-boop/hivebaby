'use client'
import dynamic from 'next/dynamic'
import type { Photo } from '@/lib/types/photo'

// LeafletMap must be dynamically imported — Leaflet breaks on SSR
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

interface Props {
  photos: Photo[]
}

export function MapView({ photos }: Props) {
  return <LeafletMap photos={photos} />
}
