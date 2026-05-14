import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ allowed: true }); // fail open
    
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    const result = await sql`
      SELECT COUNT(*) as hits 
      FROM ecosystem_telemetry 
      WHERE session_id = ${session_id} AND created_at >= NOW() - INTERVAL '24 HOURS'
    `;
    
    const hits = parseInt(result[0]?.hits || '0');
    // Free tier gets 15 requests per 24 hours
    const allowed = hits < 15;
    
    return new NextResponse(JSON.stringify({ allowed, hits, max: 15 }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new NextResponse(JSON.stringify({ allowed: true }), { // fail open
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}
