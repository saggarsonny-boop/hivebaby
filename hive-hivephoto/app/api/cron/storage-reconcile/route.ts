import { NextResponse } from 'next/server'
import { runStorageReconcile } from '@/lib/cron/storage-reconcile'

export async function GET(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
  }
  const result = await runStorageReconcile()
  return NextResponse.json(result)
}
