'use client'
import { PhotoCard } from './PhotoCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
  loading?: boolean
}

export function PhotoGrid({ photos, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-zinc-900 animate-pulse border border-zinc-800" />
        ))}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <EmptyState
        title="No photos yet"
        description="Upload your first photo to get started."
        action={{ label: 'Upload photos', href: '/upload' }}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}

export default PhotoGrid
