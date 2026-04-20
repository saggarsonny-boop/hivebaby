import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { presignUpload } from '@/lib/pipeline/presign'
import type { PresignRequest } from '@/lib/types/pipeline'

export async function POST(req: Request) {
  try {
    const userId = await requireUser()
    const body = (await req.json()) as PresignRequest
    const result = await presignUpload(userId, body)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    const message = err instanceof Error ? err.message : String(err)
    const code = (err as { code?: string }).code
    if (code === 'STORAGE_LIMIT') {
      return NextResponse.json({ error: 'Storage limit exceeded', code: 'STORAGE_LIMIT' }, { status: 402 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
