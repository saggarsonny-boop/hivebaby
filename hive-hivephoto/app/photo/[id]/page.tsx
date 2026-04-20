'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Nav } from '@/components/layout/Nav'
import { PhotoDetail } from '@/components/photo/PhotoDetail'
import { PhotoModal } from '@/components/photo/PhotoModal'
import type { Photo, PhotoFace } from '@/lib/types/photo'

export default function PhotoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [faces, setFaces] = useState<PhotoFace[]>([])
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/photos/${id}`).then((r) => r.json()),
      fetch(`/api/photos/${id}/signed-url`).then((r) => r.json()),
    ]).then(([photoData, urlData]: [Photo, { url: string }]) => {
      setPhoto(photoData)
      setSignedUrl(urlData.url ?? null)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Nav />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Nav />
        <div className="text-center py-24 text-zinc-400">Photo not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <PhotoDetail
          photo={photo}
          faces={faces}
          signedUrl={signedUrl}
          onViewFull={() => setShowModal(true)}
          onPhotoUpdate={setPhoto}
        />
      </main>
      {showModal && signedUrl && (
        <PhotoModal
          src={signedUrl}
          alt={photo.aiTitle ?? photo.userTitle ?? 'Photo'}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
