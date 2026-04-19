'use client'

import { useEffect, useState } from 'react'

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  const [photo, setPhoto] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/photos/${params.id}`).then(r => r.json()).then(setPhoto)
  }, [params.id])

  if (!photo) return <p className="text-zinc-400">Loading...</p>

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-amber-400">Photo Detail</h1>
      <img src={photo.thumbUrl} alt={photo.aiTitle || 'Photo'} className="max-h-[70vh] w-full rounded-xl object-contain" />
      <p className="text-zinc-200">{photo.userTitle || photo.aiTitle || 'Untitled'}</p>
      <p className="text-zinc-400">{photo.aiDescription}</p>
    </section>
  )
}
