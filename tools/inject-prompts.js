const fs = require('fs');
const path = require('path');

const targetEngines = {
  'ud-hr': `You are a world-class Human Resources Compliance expert. Analyze this employee handbook/policy document and extract:
1. Compliance Violations against Federal Labor Standards.
2. Incomplete or ambiguous PTO/Leave policies.
3. Hidden liability regarding wrongful termination language.`,
  
  'ud-patent': `You are a world-class Patent Attorney. Analyze this patent application and extract:
1. The core novel claim.
2. Potential prior art conflicts based on the described mechanism.
3. Ambiguities in the methodology section that could lead to rejection.`,

  'ud-maritime': `You are a world-class Maritime Law expert. Analyze this shipping manifest or charter party agreement and extract:
1. Freight liability and demurrage clauses.
2. Force Majeure definitions specifically related to piracy, weather, or port strikes.
3. Jurisdictional binding for international waters disputes.`,

  'ud-taxation': `You are a world-class Corporate Tax Auditor. Analyze this tax return or corporate financial statement and extract:
1. Red flags that typically trigger IRS audits.
2. Misclassified independent contractor vs W2 expenses.
3. Unclaimed structural depreciation deductions.`,

  'ud-aviation': `You are a world-class FAA Compliance Officer. Analyze this flight log or aircraft maintenance record and extract:
1. Discrepancies in required maintenance intervals (A, B, C, D checks).
2. Flight duty time limit violations for the crew.
3. Unresolved squawks or MEL (Minimum Equipment List) violations.`
};

const appsDir = path.join(__dirname, '..', 'apps');
const baseTemplatePath = path.join(appsDir, 'ud-contract', 'app', 'api', 'analyze', 'route.ts');

if (!fs.existsSync(baseTemplatePath)) {
  console.error("Base ud-contract template not found!");
  process.exit(1);
}

const baseTemplateContent = fs.readFileSync(baseTemplatePath, 'utf8');

Object.keys(targetEngines).forEach(engine => {
  const engineDir = path.join(appsDir, engine);
  const apiDir = path.join(engineDir, 'app', 'api', 'analyze');
  const routePath = path.join(apiDir, 'route.ts');

  if (fs.existsSync(engineDir)) {
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Swap the M&A prompt for the specific engine prompt
    const customPrompt = targetEngines[engine];
    let newContent = baseTemplateContent.replace(
      /const prompt = \`You are a world-class M&A corporate attorney\.[\s\S]*?Contract Text:/,
      `const prompt = \`${customPrompt}\n\nDocument Text:`
    );

    // Swap the sourceEngine name
    newContent = newContent.replace(
      /sourceEngine: 'ud-contract'/,
      `sourceEngine: '${engine}'`
    );

    fs.writeFileSync(routePath, newContent);
    console.log(`[+] Activated Brain for ${engine}`);
  }
});

console.log("Master Prompt Injection Complete.");
