const ENGINES = ['ud-converter', 'hive-photo', 'ud-legal', 'hive-confession', 'hive-billing'];
const TELEMETRY_URL = 'https://creator-console-i47ojkkh4-saggarsonny-3909s-projects.vercel.app/api/telemetry';

async function simulateTraffic() {
  console.log('Initiating Autonomous Telemetry Simulator...');
  let successCount = 0;

  for (let i = 0; i < 50; i++) {
    const engine = ENGINES[Math.floor(Math.random() * ENGINES.length)];
    const payload = {
      engine_id: engine,
      session_id: `session_${Math.random().toString(36).substring(7)}`,
      stamp: new Date().toISOString()
    };

    try {
      const res = await fetch(TELEMETRY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'x-vercel-ip-country': ['US', 'GB', 'DE', 'IN', 'JP'][Math.floor(Math.random() * 5)]
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        successCount++;
      } else {
        console.error('Ping failed:', res.status, await res.text());
      }
    } catch (e) {
      console.error('Ping failed', e.message);
    }
  }
  
  console.log(`Simulation complete. Dispatched ${successCount} mock DAU payloads across the ecosystem.`);
}

simulateTraffic();
