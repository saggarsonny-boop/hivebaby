import { NextResponse } from 'next/server'
import { getAllTiers } from '@/lib/pricing/tiers'

export async function GET() {
  try {
    const tiers = await getAllTiers()
    return NextResponse.json({ tiers })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
