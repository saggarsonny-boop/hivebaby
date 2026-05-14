'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardClient({ mockData, mockEngines, totalDau: initialTotalDau, mrr, revenue7d, geoStats, complianceStats }: any) {
  const [data, setData] = useState(mockData);
  const [engines, setEngines] = useState(mockEngines);
  const [totalDau, setTotalDau] = useState(initialTotalDau);

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
        <div className="stat-card">
          <div className="stat-label">Total DAU (Live)</div>
          <div className="stat-value">{totalDau.toLocaleString()}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Tracking Live</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total MAU</div>
          <div className="stat-value">1.2M</div>
          <div className="stat-change">+5% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MRR (STRIPE)</div>
          <div className="stat-value">{formatCurrency(mrr)}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Live Sync Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">REVENUE (7d)</div>
          <div className="stat-value">{formatCurrency(revenue7d)}</div>
          <div className="stat-change" style={{ color: '#10b981' }}>Live Sync Active</div>
        </div>
      </div>

      <div className="grid-stats" style={{ marginTop: '1rem' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-label">GOVERNANCE INTEGRITY</div>
          <div className="stat-value" style={{ color: complianceStats?.invalid > 0 ? '#ef4444' : '#10b981' }}>
            {complianceStats ? `${((complianceStats.valid / (complianceStats.valid + complianceStats.invalid || 1)) * 100).toFixed(1)}%` : '100%'}
          </div>
          <div className="stat-change">Queen Bee Validated Pings</div>
        </div>
        <div className="stat-card" style={{ flex: 2 }}>
          <div className="stat-label">TOP DEMOGRAPHICS (GEO)</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {geoStats && geoStats.length > 0 ? geoStats.map((geo: any) => (
              <div key={geo.geo_country} style={{ background: '#262626', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', color: '#e5e5e5' }}>
                <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>{geo.geo_country}</span>
                {geo.dau}
              </div>
            )) : <div style={{ color: '#737373', fontSize: '14px' }}>Awaiting Geo Data...</div>}
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">Live Telemetry Pings (Top Engines by DAU)</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#262626' }} />
            <Area type="monotone" dataKey="dau" stroke="#10b981" fillOpacity={1} fill="url(#colorDau)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="table-section">
        <div className="chart-header" style={{ padding: '1.5rem 1.5rem 0 1.5rem', marginBottom: '1rem' }}>Top Engines Performance</div>
        <table>
          <thead>
            <tr>
              <th>Engine ID</th>
              <th>Name</th>
              <th>Live Pings</th>
              <th>Conversion to Paid</th>
              <th>Revenue (7d)</th>
            </tr>
          </thead>
          <tbody>
            {engines.map((engine: any) => (
              <tr key={engine.id}>
                <td><code style={{ color: 'var(--accent-gold)' }}>{engine.id}</code></td>
                <td style={{ fontWeight: 500 }}>{engine.name}</td>
                <td>{engine.dau.toLocaleString()}</td>
                <td>{engine.convRate}</td>
                <td style={{ color: '#10b981' }}>{engine.rev}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
