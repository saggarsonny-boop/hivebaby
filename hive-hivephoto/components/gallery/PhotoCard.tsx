import Link from 'next/link'
import type { PhotoSummary } from '@/lib/types/photo'

export default function PhotoCard({ photo }: { photo: PhotoSummary }) {
  return (
    <Link href={`/photo/${photo.id}`} className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <img src={photo.thumbUrl} alt={photo.aiTitle ?? 'Photo'} className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" />
      <div className="p-2">
        <p className="line-clamp-1 text-sm text-zinc-200">{photo.userTitle || photo.aiTitle || 'Untitled'}</p>
        <p className="text-xs text-zinc-500">{new Date(photo.takenAt).toLocaleDateString()}</p>
      </div>
    </Link>
  )
}
