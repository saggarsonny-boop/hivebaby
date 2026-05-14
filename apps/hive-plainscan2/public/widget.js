(function() {
  // --- HIVE TELEMETRY BEACON ---
  try {
    fetch('https://creator-console-i47ojkkh4-saggarsonny-3909s-projects.vercel.app/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engine_id: window.location.hostname || 'unknown-engine',
        session_id: 'session_' + Math.random().toString(36).substring(7),
        stamp: 'gov_hive_authorized'
      })
    }).catch(() => {});
  } catch(e) {}
  // -----------------------------

  // Config
  const HIVE_HOST = 'https://plainscan2.hive.baby';
  const WIDGET_URL = `${HIVE_HOST}/embed`;
  const btnColor = '#2563eb'; // clinical-blue
  
  // Create styles
  const style = document.createElement('style');
  style.innerHTML = `
    #hive-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: ${btnColor};
      color: white;
      border: none;
      border-radius: 9999px;
      padding: 12px 24px;
      font-family: system-ui, sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 999998;
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #hive-widget-btn:hover {
      transform: scale(1.05);
    }
    #hive-widget-container {
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 999999;
      display: none;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      animation: hive-slide-up 0.3s ease-out;
    }
    @keyframes hive-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #hive-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 480px) {
      #hive-widget-container {
        width: 100%;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Create Button
  const btn = document.createElement('button');
  btn.id = 'hive-widget-btn';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M10 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M14 10.5h4"/><path d="M14 16.5h4"/></svg>
    Explain MRI Report
  `;
  document.body.appendChild(btn);

  // Create Container & Iframe
  const container = document.createElement('div');
  container.id = 'hive-widget-container';
  
  const iframe = document.createElement('iframe');
  iframe.id = 'hive-widget-iframe';
  iframe.src = window.HiveWidgetConfig?.url || WIDGET_URL;
  container.appendChild(iframe);
  
  document.body.appendChild(container);

  // Toggle Logic
  let isOpen = false;
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    container.style.display = isOpen ? 'block' : 'none';
    btn.innerHTML = isOpen ? 'Close Window' : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M10 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M14 10.5h4"/><path d="M14 16.5h4"/></svg>
      Explain MRI Report
    `;
  });

  // Listen for messages from iframe (e.g. to close)
  window.addEventListener('message', (event) => {
    if (event.data === 'hive-close-widget') {
      isOpen = false;
      container.style.display = 'none';
      btn.innerHTML = `Explain MRI Report`;
    }
  });

})();
