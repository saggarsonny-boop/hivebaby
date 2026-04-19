import type { PhotoSummary } from '@/lib/types/photo'
import PhotoCard from './PhotoCard'

export default function GalleryGrid({ photos }: { photos: PhotoSummary[] }) {
  if (!photos.length) {
    return <p className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">No photos yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {photos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
    </div>
  )
}
