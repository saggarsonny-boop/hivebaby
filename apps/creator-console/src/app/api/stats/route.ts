import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const revalidate = 0; // Disable static caching for live telemetry

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    
    // 1. Get total unique sessions (DAU)
    const totalDauResult = await sql`
      SELECT COUNT(DISTINCT session_id) as total
      FROM ecosystem_telemetry
      WHERE created_at >= NOW() - INTERVAL '24 HOURS'
    `;
    const totalDau = Number(totalDauResult[0]?.total || 0);

    // 2. Aggregate telemetry per engine
    const engineStatsResult = await sql`
      SELECT 
        engine_id, 
        COUNT(DISTINCT session_id) as dau,
        COUNT(DISTINCT CASE WHEN event_type = 'conversion' THEN session_id END) as conversions
      FROM ecosystem_telemetry
      WHERE created_at >= NOW() - INTERVAL '24 HOURS'
      GROUP BY engine_id
      ORDER BY dau DESC
    `;

    const mockEngines = engineStatsResult.map(row => {
      const dau = Number(row.dau) || 1;
      const conv = Number(row.conversions) || 0;
      const rate = ((conv / dau) * 100).toFixed(2);
      
      return {
        id: row.engine_id,
        name: row.engine_id.replace(/-/g, ' ').toUpperCase(),
        dau: Number(row.dau),
        convRate: rate + '%',
        rev: '$' + (conv * 12).toLocaleString() // estimating $12 LTV per conversion for UI completeness
      };
    });

    // 3. Time-series chart data (last 24 hours grouped by hour, or just top 5 engines for the chart)
    // For the UI's simple AreaChart, we can just return top 5 engines by DAU
    const chartData = engineStatsResult.slice(0, 10).map(row => ({
      name: row.engine_id.substring(0, 15),
      dau: Number(row.dau)
    }));

    return NextResponse.json({
      success: true,
      totalDau,
      mockEngines,
      chartData
    });

  } catch (error) {
    console.error('Failed to fetch telemetry stats', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
