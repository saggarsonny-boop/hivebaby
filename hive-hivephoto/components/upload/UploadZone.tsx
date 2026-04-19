'use client'

import { useRef, useState } from 'react'

export default function UploadZone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function toSha256(file: File): Promise<string> {
    const buf = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async function onPick(file: File) {
    try {
      setBusy(true)
      setMsg('Preparing upload...')
      const sha256Hash = await toSha256(file)

      const presign = await fetch('/api/ingest/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
          sha256Hash,
        }),
      }).then(r => r.json())

      if (!presign.uploadUrl) throw new Error(presign.error || 'Presign failed')

      setMsg('Uploading to storage...')
      const put = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!put.ok) throw new Error('Direct upload failed')

      setMsg('Finalizing...')
      const done = await fetch('/api/ingest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: presign.photoId }),
      }).then(r => r.json())

      if (done.error) throw new Error(done.error)
      setMsg('Upload complete')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-800/40 bg-zinc-900 p-6">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => e.target.files?.[0] && onPick(e.target.files[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {busy ? 'Working...' : 'Choose File'}
      </button>
      <p className="mt-3 text-sm text-zinc-400">Max 5GB. SHA-256 exact duplicate prevention enabled.</p>
      {msg && <p className="mt-2 text-sm text-amber-300">{msg}</p>}
    </div>
  )
}
