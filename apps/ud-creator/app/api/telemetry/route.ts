import { NextResponse } from 'next/server';

// Temporary in-memory store for serverless development
// In production, this will be replaced by Neon Postgres/Drizzle
let telemetryStore = {
  dau: 142891,
  revenue: 18492,
  history: [] as any[]
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.type === 'visit') {
      telemetryStore.dau += 1;
      telemetryStore.history.push({ type: 'visit', engine: data.engine, time: new Date().toISOString() });
    }
    
    if (data.type === 'revenue') {
      telemetryStore.revenue += data.amount || 0;
      telemetryStore.history.push({ type: 'revenue', amount: data.amount, engine: data.engine, time: new Date().toISOString() });
    }

    return NextResponse.json({ success: true, recorded: data.type });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    metrics: {
      dau: telemetryStore.dau,
      revenue: telemetryStore.revenue,
      dauGrowth: "↑ 12.4% vs last week",
      revenueGrowth: "↑ 4.1% vs yesterday",
      clusters: [
        { name: "Medical Cluster", count: 42 },
        { name: "Legal Cluster", count: 38 },
        { name: "Ritual Cluster", count: 15 }
      ],
      revenueBreakdown: [
        { name: "Subscriptions (PPP Adjusted)", amount: 11240, pct: 60 },
        { name: "Enterprise API Ingestion", amount: 4100, pct: 25 },
        { name: "Optional Support (Tip-Jar)", amount: 3152, pct: 15 }
      ]
    }
  });
}
