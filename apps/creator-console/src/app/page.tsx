import nextDynamic from 'next/dynamic';
const DashboardClient = nextDynamic(() => import('../components/DashboardClient'), { ssr: false });
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  // Fetch live stats
  let totalDau = 0;
  let engineStats = [];
  
  try {
    const totalQuery = await sql`SELECT COUNT(DISTINCT session_id) as total FROM ecosystem_telemetry`;
    totalDau = parseInt(totalQuery[0]?.total || '0');
    
    engineStats = await sql`
      SELECT engine_id, COUNT(DISTINCT session_id) as dau
      FROM ecosystem_telemetry
      GROUP BY engine_id
      ORDER BY dau DESC
      LIMIT 10
    `;
  } catch (e) {
    console.error(e);
  }

  // Format data for Recharts & Table
  const mockEngines = engineStats.map((e) => ({
    id: e.engine_id,
    name: e.engine_id.replace('ud-', 'UD ').replace('hive-', 'Hive '),
    dau: parseInt(e.dau),
    convRate: 'TBD%',
    rev: 'TBD'
  }));

  // Fallback if empty (before script runs)
  if (mockEngines.length === 0) {
    mockEngines.push({ id: 'Waiting for data...', name: 'Awaiting Live Pings', dau: 0, convRate: '-', rev: '-' });
  }

  // Mock trailing 7 day chart data for now, with today's live DAU appended
  const mockData = [
    { name: 'Mon', dau: 12400 },
    { name: 'Tue', dau: 15100 },
    { name: 'Wed', dau: 18200 },
    { name: 'Thu', dau: 21000 },
    { name: 'Fri', dau: 24500 },
    { name: 'Sat', dau: 28900 },
    { name: 'Live Now', dau: totalDau },
  ];

  return (
    <DashboardClient mockData={mockData} mockEngines={mockEngines} totalDau={totalDau} />
  );
}
