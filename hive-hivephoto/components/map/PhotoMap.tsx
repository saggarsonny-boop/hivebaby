'use client'
import { MapView } from './MapView'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
}

export default function PhotoMap({ photos }: Props) {
  const geoPhotos = photos.filter((p) => p.gpsLat != null && p.gpsLng != null)

  if (!geoPhotos.length) {
    return (
      <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-3 text-center p-8">
        <p className="text-white font-medium">No geotagged photos</p>
        <p className="text-sm text-zinc-400 max-w-xs">
          Photos with GPS data embedded in their EXIF will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden border border-zinc-800">
      <MapView photos={geoPhotos} />
    </div>
  )
}
