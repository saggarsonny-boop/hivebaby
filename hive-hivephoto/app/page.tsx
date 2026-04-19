import GalleryGrid from '@/components/gallery/GalleryGrid'

async function getPhotos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/photos`, { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return []
  const data = await res.json()
  return data.photos || []
}

export default async function GalleryPage() {
  const photos = await getPhotos()

  return (
    <section>
      <h1 className="mb-4 text-3xl font-semibold text-amber-400">Gallery</h1>
      <GalleryGrid photos={photos} />
    </section>
  )
}
