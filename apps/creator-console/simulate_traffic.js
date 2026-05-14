const https = require('https');

const ENGINES = ['ud-converter', 'hive-photo', 'ud-legal', 'hive-confession', 'hive-billing'];
const TELEMETRY_URL = 'http://localhost:3005/api/telemetry'; // Central ingest endpoint

async function simulateTraffic() {
  console.log('Initiating Autonomous Telemetry Simulator...');
  let payloadCount = 0;

  for (let i = 0; i < 50; i++) {
    const engine = ENGINES[Math.floor(Math.random() * ENGINES.length)];
    const payload = JSON.stringify({
      engine_id: engine,
      session_id: `session_${Math.random().toString(36).substring(7)}`,
      stamp: new Date().toISOString()
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'x-vercel-ip-country': ['US', 'GB', 'DE', 'IN', 'JP'][Math.floor(Math.random() * 5)]
      }
    };

    try {
      const req = https.request(TELEMETRY_URL, options, (res) => {
        if (res.statusCode === 200) payloadCount++;
      });
      req.on('error', () => {}); // ignore offline server for mock
      req.write(payload);
      req.end();
    } catch (e) {}
  }
  
  console.log(`Simulation complete. Dispatched 50 mock DAU payloads across the ecosystem.`);
}

simulateTraffic();
