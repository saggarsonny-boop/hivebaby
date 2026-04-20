'use client'
import Image from 'next/image'
import Link from 'next/link'
import { AITitleEditor } from './AITitleEditor'
import type { Photo, PhotoFace } from '@/lib/types/photo'

interface Props {
  photo: Photo
  faces: PhotoFace[]
  signedUrl: string | null
  onViewFull: () => void
  onPhotoUpdate: (photo: Photo) => void
}

export function PhotoDetail({ photo, faces, signedUrl, onViewFull, onPhotoUpdate }: Props) {
  const title = photo.userTitle ?? photo.aiTitle ?? 'Untitled'
  const takenAt = new Date(photo.takenAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Image */}
      <div>
        <div
          className="relative bg-zinc-900 rounded-xl overflow-hidden aspect-[4/3] cursor-zoom-in"
          onClick={onViewFull}
        >
          {(signedUrl ?? photo.thumbUrl) ? (
            <Image
              src={signedUrl ?? photo.thumbUrl!}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              No preview
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-500 text-center mt-2">Click to view full size</p>
      </div>

      {/* Details */}
      <div>
        <AITitleEditor photo={photo} onUpdate={onPhotoUpdate} />

        <div className="space-y-4 mt-6">
          {photo.aiDescription && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{photo.aiDescription}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Date</p>
            <p className="text-zinc-300 text-sm">{takenAt}</p>
          </div>

          {(photo.gpsLat != null && photo.gpsLng != null) && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Location</p>
              <p className="text-zinc-300 text-sm">
                {photo.locationName ?? `${photo.gpsLat.toFixed(4)}, ${photo.gpsLng.toFixed(4)}`}
              </p>
            </div>
          )}

          {photo.cameraMake && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Camera</p>
              <p className="text-zinc-300 text-sm">{photo.cameraMake} {photo.cameraModel}</p>
            </div>
          )}

          {photo.objects.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Objects</p>
              <div className="flex flex-wrap gap-1.5">
                {photo.objects.map((obj) => (
                  <span key={obj} className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}

          {photo.processingStatus !== 'done' && (
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>AI analysis {photo.processingStatus}…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
