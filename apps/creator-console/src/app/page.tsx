'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', dau: 12400, revenue: 4200 },
  { name: 'Tue', dau: 15100, revenue: 5100 },
  { name: 'Wed', dau: 18200, revenue: 5800 },
  { name: 'Thu', dau: 21000, revenue: 6400 },
  { name: 'Fri', dau: 24500, revenue: 7200 },
  { name: 'Sat', dau: 28900, revenue: 8100 },
  { name: 'Sun', dau: 34200, revenue: 9500 },
];

const mockEngines = [
  { id: 'ud-converter', name: 'UD Converter', dau: 12500, convRate: '4.2%', rev: '$2,100' },
  { id: 'hive-photo', name: 'Hive Photo', dau: 8200, convRate: '1.1%', rev: '$450' },
  { id: 'ud-legal', name: 'UD Legal', dau: 1500, convRate: '12.5%', rev: '$4,500' },
  { id: 'hive-confession', name: 'Hive Confession', dau: 11000, convRate: '0.8%', rev: '$220' },
];

export default function Home() {
  return (
    <>
      <div className="header">
        <h1>Global Ecosystem Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.5rem 1rem', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
            Export Report
          </button>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Total DAU (252 Engines)</div>
          <div className="stat-value">34,200</div>
          <div className="stat-change">+18% from last week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total MAU</div>
          <div className="stat-value">1.2M</div>
          <div className="stat-change">+5% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MRR (Stripe)</div>
          <div className="stat-value">$142,500</div>
          <div className="stat-change">+12% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Global Conversion Rate</div>
          <div className="stat-value">3.4%</div>
          <div className="stat-change">+0.2% from last week</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">Ecosystem Traffic & Revenue (7 Days)</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#262626' }} />
            <Area type="monotone" dataKey="dau" stroke="#10b981" fillOpacity={1} fill="url(#colorDau)" />
            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRev)" />
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
              <th>Daily Active Users</th>
              <th>Conversion to Paid</th>
              <th>Revenue (7d)</th>
            </tr>
          </thead>
          <tbody>
            {mockEngines.map((engine) => (
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
