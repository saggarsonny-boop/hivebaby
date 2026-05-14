import nextDynamic from 'next/dynamic';
const DashboardClient = nextDynamic(() => import('../components/DashboardClient'), { ssr: false });
import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  
  // Fetch live stats
  let totalDau = 0;
  let engineStats: any[] = [];
  let geoStats: any[] = [];
  let complianceStats = { valid: 0, invalid: 0 };
  
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
    
    geoStats = await sql`
      SELECT geo_country, COUNT(DISTINCT session_id) as dau
      FROM ecosystem_telemetry
      WHERE geo_country IS NOT NULL
      GROUP BY geo_country
      ORDER BY dau DESC
      LIMIT 5
    `;

    const compQuery = await sql`
      SELECT 
        SUM(CASE WHEN governance_stamp = 'gov_hive_authorized' THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN governance_stamp != 'gov_hive_authorized' OR governance_stamp IS NULL THEN 1 ELSE 0 END) as invalid
      FROM ecosystem_telemetry
    `;
    complianceStats = {
      valid: parseInt(compQuery[0]?.valid || '0'),
      invalid: parseInt(compQuery[0]?.invalid || '0')
    };
  } catch (e) {
    console.error('Neon DB Error:', e);
  }

  // Fetch Live Stripe Data
  let mrr = 0;
  let revenue7d = 0;
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
    if (stripeKey.startsWith('sk_live_') || stripeKey.startsWith('sk_test_')) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any });
      
      // Calculate MRR from active subscriptions
      const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
      mrr = subs.data.reduce((acc, sub) => {
        const item = sub.items.data[0];
        if (item && item.price.recurring?.interval === 'month') {
          return acc + (item.price.unit_amount || 0) * (item.quantity || 1);
        } else if (item && item.price.recurring?.interval === 'year') {
          return acc + ((item.price.unit_amount || 0) * (item.quantity || 1)) / 12;
        }
        return acc;
      }, 0);

      // Calculate Revenue last 7 days
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
      const charges = await stripe.charges.list({ created: { gte: sevenDaysAgo }, limit: 100 });
      revenue7d = charges.data.reduce((acc, charge) => {
        if (charge.status === 'succeeded' && !charge.refunded) {
          return acc + charge.amount;
        }
        return acc;
      }, 0);
    }
  } catch(e) {
    console.error('Stripe Fetch Error:', e);
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
    <DashboardClient 
      mockData={mockData} 
      mockEngines={mockEngines} 
      totalDau={totalDau} 
      mrr={mrr / 100} 
      revenue7d={revenue7d / 100}
      geoStats={geoStats}
      complianceStats={complianceStats}
    />
  );
}
