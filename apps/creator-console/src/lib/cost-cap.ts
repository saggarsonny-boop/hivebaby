import { neon } from '@neondatabase/serverless';

export async function checkCircuitBreaker(ipHash: string): Promise<boolean> {
  try {
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    // Check if IP has exceeded 50 requests in 24 hours
    const result = await sql`
      SELECT COUNT(*) as hits 
      FROM ecosystem_telemetry 
      WHERE ip_hash = ${ipHash} AND created_at >= NOW() - INTERVAL '24 HOURS'
    `;
    
    const hits = parseInt(result[0]?.hits || '0');
    return hits < 50; // Allow if under 50
  } catch (e) {
    return true; // Fail open if DB is down
  }
}
