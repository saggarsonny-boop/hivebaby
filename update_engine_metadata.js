const fs = require('fs');

function update(engine, title, url, desc) {
  const file = `apps/${engine}/app/layout.tsx`;
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/const APP_URL =[\s\S]*?const DESCRIPTION =[^;]*;/m, 
    `const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "${url}";\nconst TITLE = "${title}";\nconst DESCRIPTION = "${desc}";`);
  fs.writeFileSync(file, content);
}

update('hive-contract', 'HiveContract — Enterprise Legal Risk & IP Analysis', 'https://contract.hive.baby', 'Upload vendor agreements and NDAs for instant liability, risk, and non-standard clause analysis.');
update('hive-compliance', 'HiveCompliance — SOC2 & HIPAA Architecture Auditing', 'https://compliance.hive.baby', 'Instant gap analysis for SOC2, HIPAA, and GDPR by scanning your architecture and policy documents.');
update('hive-queenbee-api', 'QueenBee API — B2B AI Safety & Governance', 'https://api.hive.baby', 'Secure your LLM wrappers with the Hive’s canonical toxicity, alignment, and semantic safety interception layer.');
update('hive-clinical', 'HiveClinical — Enterprise Radiology Summarization', 'https://clinical.hive.baby', 'B2B integration for hospital systems. Automatically append patient-friendly plain-English summaries to all outgoing radiology reports.');

console.log('Updated metadata for 4 new high-revenue engines.');
