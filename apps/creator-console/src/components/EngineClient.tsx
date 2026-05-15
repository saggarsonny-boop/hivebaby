'use client';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function EngineClient({ engineId, stats, geoData, hourlyData }: any) {
  const router = useRouter();

  const getMetricColor = (val: number, inverse: boolean = false) => {
    if (inverse) return val > 5 ? '#ef4444' : '#10b981'; // e.g. errors
    return val > 0 ? '#10b981' : '#737373';
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="header" style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          ← Back to Global Orbit
        </button>
        <h1>
          Engine Deep Dive: <span style={{ color: 'var(--accent-gold)' }}>{engineId.toUpperCase()}</span>
        </h1>
      </div>

      <div className="grid-stats">
        <MetricCard label="LIVE DAU" value={stats.dau.toLocaleString()} indicator="Active Now" />
        <MetricCard label="TOTAL MAU" value={stats.mau.toLocaleString()} indicator="30 Day Window" />
        <MetricCard label="TOTAL SESSIONS" value={stats.totalSessions.toLocaleString()} indicator="All Time" />
        <MetricCard label="ESTIMATED LTV" value={stats.estimatedLtv} indicator="Based on Conversions" color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <MetricCard label="CONVERSION RATE" value={`${stats.conversionRate}%`} indicator={`${stats.conversions} Total Upgrades`} color={stats.conversionRate > 0 ? '#10b981' : '#737373'} />
        <MetricCard label="BOUNCE RATE" value={`${stats.bounceRate}%`} indicator={`${stats.bounceSessions} Single-ping sessions`} color={stats.bounceRate > 50 ? '#ef4444' : '#10b981'} />
        <MetricCard label="ERROR EXCEPTIONS" value={stats.errorCount} indicator="Client-side crashes logged" color={stats.errorCount > 0 ? '#ef4444' : '#10b981'} />
        <MetricCard label="GOVERNANCE INTEGRITY" value={`${stats.integrityScore}%`} indicator="Pings passing Queen Bee validation" color={stats.integrityScore < 100 ? '#ef4444' : '#10b981'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Peak Activity Heatmap (UTC)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <XAxis dataKey="time" stroke="#525252" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(212,175,55,0.1)' }} />
              <Bar dataKey="sessions" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Geographic Saturation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {geoData.map((geo: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{i + 1}</span>
                  <span style={{ color: '#e5e5e5' }}>{geo.geo_country}</span>
                </div>
                <div style={{ color: '#a3a3a3' }}>{Number(geo.count).toLocaleString()} Sessions</div>
              </div>
            ))}
            {geoData.length === 0 && <div style={{ color: '#737373' }}>Insufficient geographic data points collected.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, indicator, color = '#fff' }: { label: string, value: string | number, indicator: string, color?: string }) {
  return (
    <div className="stat-card" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
      <div style={{ color: '#a3a3a3', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ color: color, fontSize: '2rem', fontWeight: 700, textShadow: color !== '#fff' ? `0 0 20px ${color}40` : 'none', marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{indicator}</div>
    </div>
  );
}
