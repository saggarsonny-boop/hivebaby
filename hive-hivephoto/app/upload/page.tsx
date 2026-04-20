'use client'
import { Nav } from '@/components/layout/Nav'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadQueue } from '@/components/upload/UploadQueue'
import { StorageBar } from '@/components/pricing/StorageBar'
import { useState } from 'react'

interface QueueItem {
  id: string
  filename: string
  status: 'pending' | 'uploading' | 'done' | 'error' | 'duplicate'
  progress: number
  error?: string
  photoId?: string
  isNearDuplicate?: boolean
}

export default function UploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Upload Photos</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Photos are analyzed automatically by AI after upload.
        </p>
        <div className="mb-6">
          <StorageBar />
        </div>
        <UploadZone queue={queue} setQueue={setQueue} />
        {queue.length > 0 && <UploadQueue queue={queue} />}
      </main>
    </div>
  )
}
