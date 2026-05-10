const fs = require('fs');
const path = require('path');

function replaceInDir(dir, replacements) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, replacements);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const [search, replace] of replacements) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

// 1. HiveContract
fs.renameSync('apps/hive-contract/app/plainscan', 'apps/hive-contract/app/contract');
replaceInDir('apps/hive-contract/app', [
  ['/plainscan', '/contract'],
  ['Radiology Report', 'Vendor Agreement / NDA'],
  ['Paste your radiology report', 'Paste your legal contract'],
  ['HivePlainScan', 'HiveContract'],
  ['Plain English', 'Risk Analysis'],
  ['Doctor Questions', 'Counsel Questions'],
  ['Red Flags', 'Liability Traps'],
]);

// 2. HiveCompliance
fs.renameSync('apps/hive-compliance/app/plainscan', 'apps/hive-compliance/app/compliance');
replaceInDir('apps/hive-compliance/app', [
  ['/plainscan', '/compliance'],
  ['Radiology Report', 'Architecture Document'],
  ['Paste your radiology report', 'Paste your system architecture or policy document'],
  ['HivePlainScan', 'HiveCompliance'],
  ['Plain English', 'SOC2/HIPAA Gap Analysis'],
  ['Doctor Questions', 'Auditor Questions'],
  ['Red Flags', 'Compliance Blockers'],
]);

// 3. HiveClinical
fs.renameSync('apps/hive-clinical/app/plainscan', 'apps/hive-clinical/app/clinical');
replaceInDir('apps/hive-clinical/app', [
  ['/plainscan', '/clinical'],
  ['HivePlainScan', 'HiveClinical Enterprise'],
  // It remains medical, just enterprise focused
]);

// 4. QueenBee API
fs.renameSync('apps/hive-queenbee-api/app/plainscan', 'apps/hive-queenbee-api/app/api-dashboard');
replaceInDir('apps/hive-queenbee-api/app', [
  ['/plainscan', '/api-dashboard'],
  ['Radiology Report', 'API Payload Test'],
  ['Paste your radiology report', 'Paste a sample prompt to test toxicity interception'],
  ['HivePlainScan', 'QueenBee Governance API'],
  ['Plain English', 'Safety Analysis'],
  ['Doctor Questions', 'Integration Steps'],
  ['Red Flags', 'Toxicity Flags'],
]);

console.log('Wiring complete.');
