'use client'
import { PhotoCard } from './PhotoCard'
import { DateGroupHeader } from './DateGroupHeader'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
}

function groupByDate(photos: Photo[]): Array<{ date: string; photos: Photo[] }> {
  const groups: Record<string, Photo[]> = {}
  for (const photo of photos) {
    const d = new Date(photo.takenAt)
    const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(photo)
  }
  return Object.entries(groups).map(([date, photos]) => ({ date, photos }))
}

export function GalleryGrid({ photos }: Props) {
  const groups = groupByDate(photos)

  return (
    <div>
      {groups.map((group) => (
        <div key={group.date} className="mb-8">
          <DateGroupHeader date={group.date} count={group.photos.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 mt-3">
            {group.photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
