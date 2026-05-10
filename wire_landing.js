const fs = require('fs');

function setup(engine, title, subtitle, tiers) {
  const file = `apps/${engine}/app/page.tsx`;
  let tierHtml = tiers.map(t => `
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">${t.name}</h3>
      <p className="text-3xl font-black text-[#D4AF37] mb-4">${t.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
      <ul className="text-sm text-gray-600 mb-6 flex-grow space-y-2">
        ${t.features.map(f => `<li className="flex gap-2"><span className="text-[#0a7a6a] font-bold">✓</span> <span>${f}</span></li>`).join('')}
      </ul>
      <button className="w-full py-3 rounded-lg font-bold transition-all ${t.primary ? 'bg-[#D4AF37] text-[#1e2d3d] hover:bg-[#b08d2b]' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}">${t.cta}</button>
    </div>
  `).join('');

  const content = `
import Link from "next/link";
import HiveFooter from "@/components/HiveFooter";

export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-[#243b53] flex flex-col items-center justify-center p-6 font-sans">
      <div className="z-10 text-center max-w-4xl w-full">
        <h1 className="text-5xl font-black tracking-tight mb-4 font-serif text-[#1e2d3d]">
          ${title}
        </h1>
        <p className="text-xl text-[#64748b] mb-12 font-light tracking-wide">
          ${subtitle}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
          ${tierHtml}
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-[#1e2d3d] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            Access Dashboard →
          </Link>
        </div>
      </div>
      <div className="mt-24 w-full">
        <HiveFooter />
      </div>
    </main>
  );
}
  `;
  fs.writeFileSync(file, content.trim(), 'utf8');
}

setup('hive-contract', 'HiveContract', 'Enterprise Legal Risk & IP Analysis Engine.', [
  { name: 'Free', price: '$0', features: ['1 contract scan/mo', 'Max 10 pages', 'Standard Liability check', 'Cancel anytime'], cta: 'Start Free', primary: false },
  { name: 'Pro', price: '$49', features: ['50 scans/mo', 'Export to Risk PDF', 'IP Risk highlighting', 'Cancel anytime'], cta: 'Upgrade to Pro', primary: true },
  { name: 'Enterprise', price: '$499', features: ['Unlimited scans', 'Custom Company Rules', 'Team Seats', 'Cancel anytime'], cta: 'Contact Sales', primary: false },
]);

setup('hive-compliance', 'HiveCompliance', 'SOC2 & HIPAA Architecture Auditing.', [
  { name: 'Free', price: '$0', features: ['1 policy scan', 'Basic gaps', 'Standard checks', 'Cancel anytime'], cta: 'Start Free', primary: false },
  { name: 'Pro', price: '$99', features: ['Monthly gap analysis', 'Startup tier', 'Actionable fixes', 'Cancel anytime'], cta: 'Upgrade to Pro', primary: true },
  { name: 'Enterprise', price: '$999', features: ['Unlimited scanning', 'BAA Coverage', 'Verification Badge', 'Cancel anytime'], cta: 'Contact Sales', primary: false },
]);

setup('hive-queenbee-api', 'QueenBee Governance API', 'B2B AI Safety & Alignment Infrastructure.', [
  { name: 'Free', price: '$0', features: ['10k requests/mo', 'Standard toxicity filter', 'Watermark required', 'Cancel anytime'], cta: 'Get API Key', primary: false },
  { name: 'Pro', price: '$49', features: ['100k requests/mo', 'No watermark', 'Custom thresholds', 'Cancel anytime'], cta: 'Upgrade to Pro', primary: true },
  { name: 'Enterprise', price: '$2000', features: ['SLA guarantees', 'Dedicated throughput', 'Custom models', 'Cancel anytime'], cta: 'Contact Sales', primary: false },
]);

setup('hive-clinical', 'HiveClinical Enterprise', 'Automated Patient-Friendly Radiology Summaries for Hospital Networks.', [
  { name: 'Pilot', price: '$500', features: ['Single clinic', 'Up to 10 doctors', 'Basic API', 'Cancel anytime'], cta: 'Start Pilot', primary: true },
  { name: 'Network', price: '$3500', features: ['Full hospital', 'Unlimited volume', 'EHR Integration', 'Cancel anytime'], cta: 'Upgrade to Network', primary: false },
  { name: 'Enterprise', price: '$10000', features: ['Epic/Cerner API', 'Full BAA compliance', 'On-premise option', 'Cancel anytime'], cta: 'Contact Sales', primary: false },
]);

console.log('Landing pages and pricing wired for all 4 engines.');
