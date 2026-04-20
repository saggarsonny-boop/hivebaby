'use client'
import Link from 'next/link'

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
}

const statusLabel: Record<QueueItem['status'], string> = {
  pending: 'Waiting…',
  uploading: 'Uploading…',
  done: 'Done',
  error: 'Error',
  duplicate: 'Exact duplicate',
}

const statusColor: Record<QueueItem['status'], string> = {
  pending: 'text-zinc-500',
  uploading: 'text-amber-400',
  done: 'text-green-400',
  error: 'text-red-400',
  duplicate: 'text-zinc-500',
}

export function UploadQueue({ queue }: Props) {
  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Upload queue</h3>
      {queue.map((item) => (
        <div key={item.id} className="bg-zinc-900 rounded-lg px-4 py-3 border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-white truncate flex-1 mr-3">{item.filename}</span>
            <div className="flex items-center gap-2">
              {item.isNearDuplicate && (
                <Link href="/duplicates" className="text-xs text-amber-400 hover:text-amber-300">
                  Review duplicate
                </Link>
              )}
              {item.status === 'done' && item.photoId && (
                <Link href={`/photo/${item.photoId}`} className="text-xs text-amber-400 hover:text-amber-300">
                  View
                </Link>
              )}
              <span className={`text-xs ${statusColor[item.status]}`}>
                {item.status === 'error' && item.error ? item.error : statusLabel[item.status]}
              </span>
            </div>
          </div>
          {item.status === 'uploading' && (
            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div
                className="bg-amber-400 h-1 rounded-full transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
