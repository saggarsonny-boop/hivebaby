'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardClient({ mockData, mockEngines, totalDau: initialTotalDau, mrr, revenue7d, geoStats, complianceStats }: any) {
  const [data, setData] = useState(mockData);
  const [engines, setEngines] = useState(mockEngines);
  const [data, setData] = useState(mockData);
  const [engines, setEngines] = useState(mockEngines);
  const [totalDau, setTotalDau] = useState(initialTotalDau);
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    // Poll the live stats endpoint every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setTotalDau(stats.totalDau);
          setEngines(stats.mockEngines);
          // Only update chart data if there's actual data
          if (stats.chartData && stats.chartData.length > 0) {
            setData(stats.chartData);
          }
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="header">
        <h1>Global Ecosystem Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.5rem 1rem', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: 'red', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
            Live Feed Active
          </button>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>Total DAU (Live)</div>
          <div className="stat-value" style={{ color: '#fff', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>{totalDau.toLocaleString()}</div>
          <div className="stat-change" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span>
            Tracking Live
          </div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>Total MAU</div>
          <div className="stat-value" style={{ color: '#fff' }}>1.2M</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>+5% from last month</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>MRR (STRIPE)</div>
          <div className="stat-value" style={{ color: '#fff' }}>{formatCurrency(mrr)}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Live Sync Active</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>REVENUE (7d)</div>
          <div className="stat-value" style={{ color: '#fff' }}>{formatCurrency(revenue7d)}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Live Sync Active</div>
        </div>
      </div>

      <div className="grid-stats" style={{ marginTop: '1rem' }}>
        <div className="stat-card" style={{ flex: 1, background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9))', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>GOVERNANCE INTEGRITY</div>
          <div className="stat-value" style={{ color: complianceStats?.invalid > 0 ? '#ef4444' : '#10b981', textShadow: complianceStats?.invalid > 0 ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px rgba(16,185,129,0.5)' }}>
            {complianceStats ? `${((complianceStats.valid / (complianceStats.valid + complianceStats.invalid || 1)) * 100).toFixed(1)}%` : '100%'}
          </div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Queen Bee Validated Pings</div>
        </div>
        <div className="stat-card" style={{ flex: 2, background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="stat-label" style={{ color: '#a3a3a3' }}>TOP DEMOGRAPHICS (GEO)</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
            {geoStats && geoStats.length > 0 ? geoStats.map((geo: any) => (
              <div key={geo.geo_country} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', color: '#e5e5e5', border: '1px solid rgba(212,175,55,0.1)' }}>
                <span style={{ color: 'var(--accent-gold)', marginRight: '8px', fontWeight: 600 }}>{geo.geo_country}</span>
                {geo.dau.toLocaleString()} Users
              </div>
            )) : <div style={{ color: '#737373', fontSize: '14px' }}>Awaiting Geo Data...</div>}
          </div>
        </div>
      </div>

      <div className="chart-section" style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginTop: '2rem' }}>
        <div className="chart-header" style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Live Telemetry Pings (Top Engines by DAU)</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#a3a3a3' }} />
            <YAxis stroke="#525252" tick={{ fill: '#a3a3a3' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: 'var(--accent-gold)' }} />
            <Area type="monotone" dataKey="dau" stroke="var(--accent-gold)" strokeWidth={2} fillOpacity={1} fill="url(#colorDau)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="table-section" style={{ background: 'rgba(20,20,20,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '2rem', overflow: 'hidden' }}>
        <div className="chart-header" style={{ padding: '1.5rem 1.5rem 0 1.5rem', marginBottom: '1rem', color: '#fff', fontSize: '1.1rem' }}>Top Engines Performance</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a3a3a3', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Engine ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Live Pings</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Conversion Rate</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Est. Revenue (LTV)</th>
            </tr>
          </thead>
          <tbody>
            {engines.map((engine: any, idx: number) => (
              <tr key={engine.id} onClick={() => router.push(`/engine/${engine.id}`)} style={{ borderBottom: idx !== engines.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.5rem' }}><code style={{ color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{engine.id}</code></td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#e5e5e5' }}>{engine.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#a3a3a3' }}>{engine.dau.toLocaleString()}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ background: engine.convRate !== '0.00%' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: engine.convRate !== '0.00%' ? '#10b981' : '#737373', padding: '4px 10px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500 }}>
                    {engine.convRate}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: engine.rev !== '$0' ? '#10b981' : '#737373', fontWeight: 500 }}>{engine.rev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
