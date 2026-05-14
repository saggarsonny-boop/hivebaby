const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_B3kfDXLNUP5Z@ep-wild-surf-anjb0x31-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
const ENGINES = ['ud-converter', 'hive-photo', 'ud-legal', 'hive-confession', 'hive-billing'];

async function insertLive() {
  console.log('Inserting 50 live pings directly to Neon DB...');
  let count = 0;
  for(let i = 0; i < 50; i++) {
    const engine = ENGINES[Math.floor(Math.random() * ENGINES.length)];
    const session = `session_${Math.random().toString(36).substring(7)}`;
    const country = ['US', 'GB', 'DE', 'IN', 'JP'][Math.floor(Math.random() * 5)];
    try {
      await sql`
        INSERT INTO ecosystem_telemetry (engine_id, session_id, user_agent, geo_country, event_type, governance_stamp)
        VALUES (${engine}, ${session}, 'Simulation Script', ${country}, 'page_view', 'mock_stamp')
      `;
      count++;
    } catch(e) {
      console.error(e);
    }
  }
  console.log(`Inserted ${count} rows. DAU will now be live.`);
}

insertLive();
