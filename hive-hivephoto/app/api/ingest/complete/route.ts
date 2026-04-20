import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { finalizeUpload } from '@/lib/pipeline/finalize-upload'
import type { CompleteUploadRequest } from '@/lib/types/pipeline'

export async function POST(req: Request) {
  try {
    const userId = await requireUser()
    const body = (await req.json()) as CompleteUploadRequest
    const result = await finalizeUpload(userId, body.photoId, body.storageKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
