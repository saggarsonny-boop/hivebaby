'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { PhotoCard } from '@/components/gallery/PhotoCard'
import type { Person, Photo } from '@/lib/types/photo'

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<Person | null>(null)
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/people/${id}`)
      .then((r) => r.json())
      .then(async (data: { person: Person; photoIds: string[] }) => {
        setPerson(data.person)
        setPhotoIds(data.photoIds ?? [])
        // Fetch photos
        const photoPromises = (data.photoIds ?? []).slice(0, 50).map((pid) =>
          fetch(`/api/photos/${pid}`).then((r) => r.json() as Promise<Photo>)
        )
        const fetched = await Promise.all(photoPromises)
        setPhotos(fetched.filter(Boolean))
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/people" className="text-zinc-400 hover:text-white text-sm">
            ← People
          </Link>
          {person && (
            <h1 className="text-2xl font-bold">{person.name}</h1>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
