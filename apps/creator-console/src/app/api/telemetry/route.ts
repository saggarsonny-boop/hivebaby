import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Handle CORS Preflight for all subdomains
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate payload
    if (!data.engine_id || !data.session_id) {
      return NextResponse.json({ error: 'Missing required telemetry parameters' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    await sql`
      INSERT INTO ecosystem_telemetry (engine_id, session_id, user_agent, geo_country, event_type, governance_stamp)
      VALUES (${data.engine_id}, ${data.session_id}, ${req.headers.get('user-agent') || 'unknown'}, ${req.headers.get('x-vercel-ip-country') || 'US'}, ${data.event_type || 'page_view'}, ${data.stamp || 'none'})
    `;

    return new NextResponse(JSON.stringify({ success: true, logged: data.engine_id }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to ingest telemetry' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
