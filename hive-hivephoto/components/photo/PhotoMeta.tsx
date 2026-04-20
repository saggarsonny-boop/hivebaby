'use client'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photo: Photo
}

export default function PhotoMeta({ photo }: Props) {
  return (
    <div className="space-y-4">
      {photo.aiDescription && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Description</p>
          <p className="text-sm text-zinc-200">{photo.aiDescription}</p>
        </div>
      )}

      {photo.objects.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Objects</p>
          <div className="flex flex-wrap gap-1.5">
            {photo.objects.map((obj) => (
              <span key={obj} className="px-2 py-0.5 text-xs rounded-full bg-amber-400/10 text-amber-400">
                {obj}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {photo.scenes.length > 0 && (
          <div>
            <p className="text-xs text-zinc-500">Scene</p>
            <p className="text-zinc-200 capitalize">{photo.scenes.join(', ')}</p>
          </div>
        )}

        {photo.locationName && (
          <div>
            <p className="text-xs text-zinc-500">Location</p>
            <p className="text-zinc-200">{photo.locationName}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-zinc-500">Date</p>
          <p className="text-zinc-200">
            {new Date(photo.takenAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {photo.gpsLat != null && photo.gpsLng != null && (
          <div>
            <p className="text-xs text-zinc-500">GPS</p>
            <p className="text-zinc-200 text-xs font-mono">
              {photo.gpsLat.toFixed(5)}, {photo.gpsLng.toFixed(5)}
            </p>
          </div>
        )}

        {photo.width && photo.height && (
          <div>
            <p className="text-xs text-zinc-500">Dimensions</p>
            <p className="text-zinc-200">{photo.width} × {photo.height}</p>
          </div>
        )}

        {photo.fileSizeBytes && (
          <div>
            <p className="text-xs text-zinc-500">File size</p>
            <p className="text-zinc-200">
              {(photo.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        )}

        {photo.format && (
          <div>
            <p className="text-xs text-zinc-500">Format</p>
            <p className="text-zinc-200">{photo.format.toUpperCase()}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-zinc-600 pt-2 border-t border-zinc-800">
        <p>Status: {photo.processingStatus}</p>
        {photo.processingError && (
          <p className="text-red-400 mt-1">Error: {photo.processingError}</p>
        )}
      </div>
    </div>
  )
}
