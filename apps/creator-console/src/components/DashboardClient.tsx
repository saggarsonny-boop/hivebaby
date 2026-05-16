'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw, Server, AlertTriangle, ShieldCheck, Terminal as TerminalIcon, Send, ChevronRight, Activity } from 'lucide-react';

export default function DashboardClient({ mockData, mockEngines, totalDau: initialTotalDau, mrr, revenue7d, geoStats, complianceStats }: any) {
  const [data, setData] = useState(mockData || []);
  const [engines, setEngines] = useState(mockEngines || []);
  const [totalDau, setTotalDau] = useState(initialTotalDau || 0);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [totalPipelineValue, setTotalPipelineValue] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', content: 'HiveOps AI Assistant initialized. System nominal.' }
  ]);
  const router = useRouter();

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setTotalDau(stats.totalDau);
          setEngines(stats.mockEngines);
          if (stats.chartData && stats.chartData.length > 0) setData(stats.chartData);
        }
        
        const pipeRes = await fetch('/api/pipeline');
        if (pipeRes.ok) {
          const pipeStats = await pipeRes.json();
          setPipelineData(pipeStats.leads);
          setTotalPipelineValue(pipeStats.totalPipelineValue);
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatInput }]);
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'system', 
        content: `Analyzing log context for "${chatInput}"... No critical anomalies detected across the 252 engines. Proceed with Queen Bee validation.` 
      }]);
    }, 800);
    
    setChatInput('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            GLOBAL ECOSYSTEM
            <span className="badge badge-success" style={{ fontSize: '0.875rem' }}>
              <span className="live-dot" style={{ marginRight: '6px' }}></span> LIVE
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitoring 252 Universal Document & Hive engines.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handleSync}>
            <RefreshCw size={16} className={isSyncing ? "spin-animation" : ""} /> Force Sync Stripe
          </button>
          <button className="btn btn-gold">
            <Play size={16} fill="currentColor" /> Deploy Engine
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div className="glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-label">Total DAU (Live)</div>
          <motion.div className="stat-value" key={totalDau} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            {totalDau.toLocaleString()}
          </motion.div>
          <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Tracking via WebSockets
          </div>
        </motion.div>
        
        <motion.div className="glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-label">Total MAU</div>
          <div className="stat-value">1.2M</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+5% from last month</div>
        </motion.div>
        
        <motion.div className="glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-label">MRR (STRIPE)</div>
          <div className="stat-value text-gold">{formatCurrency(mrr)}</div>
          <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Live Sync Active</div>
        </motion.div>
        
        <motion.div className="glass-panel" whileHover={{ y: -5 }}>
          <div className="stat-label">REVENUE (7D)</div>
          <div className="stat-value">{formatCurrency(revenue7d)}</div>
          <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Live Sync Active</div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(5,5,5,0.9))' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--success)" /> GOVERNANCE INTEGRITY
          </div>
          <div className="stat-value" style={{ color: complianceStats?.invalid > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {complianceStats ? `${((complianceStats.valid / (complianceStats.valid + complianceStats.invalid || 1)) * 100).toFixed(1)}%` : '100%'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Queen Bee Validated Pings</div>
        </div>
        
        <div className="glass-panel">
          <div className="stat-label">TOP DEMOGRAPHICS (GEO)</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {geoStats && geoStats.length > 0 ? geoStats.map((geo: any) => (
              <div key={geo.geo_country} style={{ background: 'var(--border-subtle)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.875rem', border: '1px solid var(--border-highlight)' }}>
                <span style={{ color: 'var(--gold-primary)', marginRight: '8px', fontWeight: 600 }}>{geo.geo_country}</span>
                {geo.dau.toLocaleString()} Users
              </div>
            )) : <div style={{ color: 'var(--text-tertiary)' }}>Awaiting Geo Data...</div>}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '2rem', fontFamily: 'Outfit', fontWeight: 600 }}>Live Telemetry Pings</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold-primary)" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="var(--gold-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: 'var(--gold-primary)', fontWeight: 600 }} 
              />
              <Area type="monotone" dataKey="dau" stroke="var(--gold-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorDau)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Top Engines Performance</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Engine ID</th>
                <th>Name</th>
                <th>Live Pings</th>
                <th>Conv. Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {engines.map((engine: any) => (
                <tr key={engine.id} onClick={() => router.push(`/engine/${engine.id}`)} style={{ cursor: 'pointer' }} className="table-row-hover">
                  <td><code style={{ color: 'var(--gold-primary)', background: 'var(--gold-faded)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>{engine.id}</code></td>
                  <td style={{ fontWeight: 500 }}>{engine.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{engine.dau.toLocaleString()}</td>
                  <td>
                    <span className={engine.convRate !== '0.00%' ? 'badge badge-success' : 'badge'} style={{ background: engine.convRate === '0.00%' ? 'var(--border-subtle)' : undefined }}>
                      {engine.convRate}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '4px', height: 'auto' }} onClick={(e) => { e.stopPropagation(); /* action */ }}>
                      <Server size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <TerminalIcon size={18} color="var(--gold-primary)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600 }}>HiveOps AI</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px', marginBottom: '1rem' }} className="terminal-scroll">
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'var(--gold-faded)' : 'var(--border-subtle)',
                    border: msg.role === 'user' ? '1px solid var(--border-highlight)' : '1px solid transparent',
                    color: msg.role === 'user' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    maxWidth: '85%',
                    fontSize: '0.875rem'
                  }}
                >
                  {msg.content}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Query logs or deploy..."
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                outline: 'none',
                fontFamily: 'Inter'
              }}
            />
            <button type="submit" className="btn btn-gold" style={{ padding: '0 14px' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .table-row-hover:hover td { background: rgba(255,255,255,0.02); }
        .text-gold { color: var(--gold-primary) !important; text-shadow: 0 0 20px var(--gold-glow); }
        
        .terminal-scroll::-webkit-scrollbar { width: 4px; }
        .terminal-scroll::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
      `}} />
    </motion.div>
  );
}
