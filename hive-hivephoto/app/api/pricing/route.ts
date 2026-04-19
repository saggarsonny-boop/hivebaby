import { NextRequest, NextResponse } from 'next/server'
import { getAllTiers } from '@/lib/db/subscriptions'

export async function GET(_req: NextRequest) {
  try {
    const tiers = await getAllTiers()
    return NextResponse.json({ tiers })
  } catch (err) {
    console.error('[pricing]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
