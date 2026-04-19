import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { handlePresign, ValidationError, DuplicateError, StorageLimitError } from '@/lib/pipeline/presign'
import type { PresignRequest } from '@/lib/types/photo'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await req.json() as PresignRequest

    if (!body.fileName || !body.contentType || !body.fileSizeBytes || !body.sha256Hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await handlePresign(userId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err instanceof DuplicateError) {
      return NextResponse.json({ error: 'Duplicate', existingPhotoId: err.existingPhotoId }, { status: 409 })
    }
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    if (err instanceof StorageLimitError) return NextResponse.json({ error: err.message }, { status: 402 })
    console.error('[presign]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
