'use client'
import { useRef, useState } from 'react'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import type { PresignResponse, CompleteUploadResponse } from '@/lib/types/pipeline'

interface QueueItem {
  id: string
  filename: string
  status: 'pending' | 'uploading' | 'done' | 'error' | 'duplicate'
  progress: number
  error?: string
  photoId?: string
  isNearDuplicate?: boolean
}

interface Props {
  queue: QueueItem[]
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>
}

async function sha256Hex(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function UploadZone({ queue, setQueue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [storageLimitHit, setStorageLimitHit] = useState(false)

  function updateItem(id: string, update: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...update } : item)))
  }

  async function processFile(file: File) {
    const queueId = `${Date.now()}-${file.name}`
    const newItem: QueueItem = {
      id: queueId,
      filename: file.name,
      status: 'pending',
      progress: 0,
    }
    setQueue((prev) => [...prev, newItem])

    try {
      updateItem(queueId, { status: 'uploading', progress: 10 })

      // Compute SHA-256
      const sha256Hash = await sha256Hex(file)
      updateItem(queueId, { progress: 20 })

      // Presign
      const presignRes = await fetch('/api/ingest/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          fileSize: file.size,
          sha256Hash,
        }),
      })

      if (presignRes.status === 402) {
        setStorageLimitHit(true)
        updateItem(queueId, { status: 'error', error: 'Storage limit reached' })
        return
      }

      const presign = (await presignRes.json()) as PresignResponse

      if (presign.isDuplicate) {
        updateItem(queueId, { status: 'duplicate', progress: 100, photoId: presign.existingId })
        return
      }

      if (!presign.uploadUrl || !presign.photoId || !presign.storageKey) {
        throw new Error('Invalid presign response')
      }

      updateItem(queueId, { progress: 30 })

      // PUT to R2
      const putRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      })

      if (!putRes.ok) throw new Error(`R2 upload failed: ${putRes.status}`)
      updateItem(queueId, { progress: 70 })

      // Complete
      const completeRes = await fetch('/api/ingest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: presign.photoId, storageKey: presign.storageKey }),
      })
      const complete = (await completeRes.json()) as CompleteUploadResponse

      updateItem(queueId, {
        status: 'done',
        progress: 100,
        photoId: complete.photoId,
        isNearDuplicate: complete.isNearDuplicate,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateItem(queueId, { status: 'error', error: msg })
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
    for (const file of images) {
      await processFile(file)
    }
  }

  return (
    <>
      {storageLimitHit && (
        <UpgradePrompt
          message="You've reached your storage limit."
          onDismiss={() => setStorageLimitHit(false)}
        />
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
        }`}
      >
        <div className="text-4xl mb-3">📷</div>
        <p className="text-white font-semibold mb-1">Drop photos here</p>
        <p className="text-zinc-400 text-sm">or click to select files</p>
        <p className="text-zinc-600 text-xs mt-2">JPEG, PNG, HEIC, WebP, GIF supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </>
  )
}
