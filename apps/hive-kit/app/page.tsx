'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function HiveKit() {
  const [subscribers, setSubscribers] = useState(1204890);
  const [views, setViews] = useState(8402910);

  // Simulate live data ticking upwards like an API sync
  useEffect(() => {
    const interval = setInterval(() => {
      setSubscribers(prev => prev + Math.floor(Math.random() * 3));
      setViews(prev => prev + Math.floor(Math.random() * 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="kit-container">
      <div className="glass-panel">
        <div className="content-layer">
          
          <div className="header">
            <div className="avatar">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Creator Profile" />
            </div>
            <div className="profile-info">
              <h1>Elena Rodriguez</h1>
              <p>Tech Creator & AI Enthusiast • Building the Future</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">
                {subscribers.toLocaleString()} <span className="live-indicator" title="Live API Syncing"></span>
              </div>
              <div className="stat-label">YouTube Subs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {views.toLocaleString()} <span className="live-indicator"></span>
              </div>
              <div className="stat-label">Monthly Views</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">8.4%</div>
              <div className="stat-label">Engagement Rate</div>
            </div>
          </div>

          <div className="cta-section">
            <div className="uds-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>Universal Document <strong>Live Sync Active</strong></span>
            </div>
            <button className="btn-primary">Book a Partnership</button>
          </div>

        </div>
      </div>
    </div>
  );
}