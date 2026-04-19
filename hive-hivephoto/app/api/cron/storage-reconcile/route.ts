import { NextRequest, NextResponse } from 'next/server'
import { requireCronSecret, AuthError } from '@/lib/auth/guards'
import { runStorageReconcile } from '@/lib/cron/storage-reconcile'

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)
    const result = await runStorageReconcile()
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
