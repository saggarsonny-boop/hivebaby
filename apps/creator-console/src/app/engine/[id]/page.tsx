import { neon } from '@neondatabase/serverless';
import nextDynamic from 'next/dynamic';

const EngineClient = nextDynamic(() => import('../../../components/EngineClient'), { ssr: false });

export const dynamic = 'force-dynamic';

export default async function EnginePage({ params }: { params: { id: string } }) {
  const engineId = params.id;
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  let stats = {
    dau: 0,
    mau: 0,
    totalSessions: 0,
    conversions: 0,
    bounceSessions: 0,
    errorCount: 0,
    validPings: 0,
    invalidPings: 0,
  };

  let geoData: any[] = [];
  let deviceData: any[] = [];
  let hourlyData: any[] = [];

  try {
    // 1. Core aggregates
    const coreQuery = await sql`
      SELECT 
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '24 HOURS' THEN session_id END) as dau,
        COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 DAYS' THEN session_id END) as mau,
        COUNT(DISTINCT CASE WHEN event_type = 'conversion' THEN session_id END) as conversions,
        COUNT(DISTINCT CASE WHEN event_type = 'error' THEN session_id END) as error_count,
        SUM(CASE WHEN governance_stamp = 'gov_hive_authorized' THEN 1 ELSE 0 END) as valid_pings,
        SUM(CASE WHEN governance_stamp != 'gov_hive_authorized' OR governance_stamp IS NULL THEN 1 ELSE 0 END) as invalid_pings
      FROM ecosystem_telemetry
      WHERE engine_id = ${engineId}
    `;

    // 2. Bounce Rate (Sessions with only 1 event)
    const bounceQuery = await sql`
      SELECT COUNT(*) as bounced
      FROM (
        SELECT session_id
        FROM ecosystem_telemetry
        WHERE engine_id = ${engineId}
        GROUP BY session_id
        HAVING COUNT(*) = 1
      ) sub
    `;

    // 3. Geo Distribution
    geoData = await sql`
      SELECT geo_country, COUNT(DISTINCT session_id) as count
      FROM ecosystem_telemetry
      WHERE engine_id = ${engineId} AND geo_country IS NOT NULL
      GROUP BY geo_country
      ORDER BY count DESC
      LIMIT 10
    `;

    // 4. Time of Day (Peak hours in UTC)
    hourlyData = await sql`
      SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(DISTINCT session_id) as count
      FROM ecosystem_telemetry
      WHERE engine_id = ${engineId} AND created_at >= NOW() - INTERVAL '7 DAYS'
      GROUP BY hour
      ORDER BY hour ASC
    `;

    if (coreQuery.length > 0) {
      stats.totalSessions = Number(coreQuery[0].total_sessions);
      stats.dau = Number(coreQuery[0].dau);
      stats.mau = Number(coreQuery[0].mau);
      stats.conversions = Number(coreQuery[0].conversions);
      stats.errorCount = Number(coreQuery[0].error_count);
      stats.validPings = Number(coreQuery[0].valid_pings);
      stats.invalidPings = Number(coreQuery[0].invalid_pings);
      stats.bounceSessions = Number(bounceQuery[0]?.bounced || 0);
    }

  } catch (error) {
    console.error('Failed to fetch engine specific data', error);
  }

  // Derived Metrics
  const conversionRate = stats.totalSessions > 0 ? (stats.conversions / stats.totalSessions) * 100 : 0;
  const bounceRate = stats.totalSessions > 0 ? (stats.bounceSessions / stats.totalSessions) * 100 : 0;
  const integrityScore = (stats.validPings + stats.invalidPings) > 0 ? (stats.validPings / (stats.validPings + stats.invalidPings)) * 100 : 100;

  // Formatting for Recharts
  const chartData = hourlyData.map(h => ({
    time: `${h.hour}:00`,
    sessions: Number(h.count)
  }));

  // Ensure 24h data
  const fullChartData = Array.from({length: 24}, (_, i) => {
    const existing = chartData.find(d => d.time === `${i}:00`);
    return existing || { time: `${i}:00`, sessions: 0 };
  });

  return (
    <EngineClient 
      engineId={engineId}
      stats={{
        ...stats,
        conversionRate: conversionRate.toFixed(1),
        bounceRate: bounceRate.toFixed(1),
        integrityScore: integrityScore.toFixed(1),
        estimatedLtv: '$' + (stats.conversions * 12).toLocaleString()
      }}
      geoData={geoData}
      hourlyData={fullChartData}
    />
  );
}
