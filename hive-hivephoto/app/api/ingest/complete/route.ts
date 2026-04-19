import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { finalizeUpload } from '@/lib/pipeline/finalize-upload'
import type { CompleteRequest } from '@/lib/types/photo'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await req.json() as CompleteRequest

    if (!body.photoId) {
      return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })
    }

    const result = await finalizeUpload(userId, body.photoId)
    return NextResponse.json({
      photoId: result.photoId,
      thumbUrl: result.thumbUrl,
      isNearDuplicate: result.isNearDuplicate,
      processingStatus: 'pending',
    })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Internal server error'
    console.error('[ingest/complete]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
