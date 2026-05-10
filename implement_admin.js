const fs = require('fs');
const path = require('path');

const write = (relPath, content) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
};

console.log("Scaffolding Admin Cluster Engines...");

// 1. Hive Support (AI Customer Support Engine)
write('apps/hive-support/app/page.tsx', `
"use client";
import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveSupportV0() {
  const [view, setView] = useState<'inbox' | 'flagged' | 'settings'>('inbox');

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E2E8F0] p-6 flex flex-col">
         <div className="font-bold text-xl mb-8 text-[#334155]">Support Engine</div>
         <nav className="flex flex-col gap-2">
            <button onClick={() => setView('inbox')} className={\`text-left px-4 py-2 rounded-lg font-bold text-sm \${view === 'inbox' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}\`}>
              Inbox <span className="float-right bg-[#DBEAFE] px-2 py-0.5 rounded-full text-xs">12</span>
            </button>
            <button onClick={() => setView('flagged')} className={\`text-left px-4 py-2 rounded-lg font-bold text-sm \${view === 'flagged' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}\`}>
              Needs Review <span className="float-right bg-[#FEE2E2] px-2 py-0.5 rounded-full text-xs">3</span>
            </button>
            <button onClick={() => setView('settings')} className={\`text-left px-4 py-2 rounded-lg font-bold text-sm \${view === 'settings' ? 'bg-[#F1F5F9] text-[#334155]' : 'text-[#64748B] hover:bg-[#F1F5F9]'}\`}>
              Settings
            </button>
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8">
         {view === 'inbox' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">Recent Interactions</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                 {/* Item 1 */}
                 <div className="p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">sara@example.com</span>
                       <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded">Auto-Resolved</span>
                    </div>
                    <div className="text-sm text-[#64748B] mb-2 truncate">"How do I change my password?"</div>
                    <div className="text-xs text-[#94A3B8]">Intent: Confusion • Tone: Neutral • Action: Sent Doc Link</div>
                 </div>
                 {/* Item 2 */}
                 <div className="p-4 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-sm">mark@example.com</span>
                       <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] bg-[#DBEAFE] px-2 py-1 rounded">Draft Ready</span>
                    </div>
                    <div className="text-sm text-[#64748B] mb-2 truncate">"I loved using this tool yesterday."</div>
                    <div className="text-xs text-[#94A3B8]">Intent: Praise • Tone: Warm • Action: Queued for Send</div>
                 </div>
              </div>
           </div>
         )}

         {view === 'flagged' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6 text-[#DC2626]">Requires Your Review</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#FCA5A5] p-6 mb-4">
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">angry.customer@example.com</span>
                    <span className="text-xs font-bold text-[#DC2626] uppercase tracking-widest">Flag: Legal Threat</span>
                 </div>
                 <div className="bg-[#FEF2F2] p-4 rounded-lg text-sm text-[#991B1B] mb-4">
                    "If you don't refund me for the last 6 months immediately, I am contacting my lawyer."
                 </div>
                 <div className="border-t border-[#E2E8F0] pt-4 flex justify-end gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg">Ignore</button>
                    <button className="px-4 py-2 text-sm font-bold bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C]">Draft Custom Reply</button>
                 </div>
              </div>
           </div>
         )}

         {view === 'settings' && (
           <div className="animate-fade-in w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-6">Engine Logic</h2>
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
                 <h3 className="font-bold mb-4">Auto-Send Configuration (Option B)</h3>
                 <label className="flex items-center gap-3 mb-6">
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-sm text-[#475569]">Automatically send safe replies on my behalf</span>
                 </label>

                 <h3 className="font-bold mb-4 border-t border-[#E2E8F0] pt-6">Flagging Rules</h3>
                 <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Legal Threats ✕</span>
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Medical Claims ✕</span>
                    <span className="bg-[#F1F5F9] text-[#475569] text-xs font-bold px-3 py-1.5 rounded-full">Abuse ✕</span>
                    <span className="bg-[#DBEAFE] text-[#2563EB] text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer">+ Add Rule</span>
                 </div>
              </div>
           </div>
         )}
      </div>

      <style jsx global>{\`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      \`}</style>
    </main>
  );
}
`);
write('apps/hive-support/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

// 2. Hive Billing
write('apps/hive-billing/app/page.tsx', `
"use client";
import React from 'react';

export default function HiveBillingV0() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2B2A] flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-serif mb-4">Billing & Subscriptions</h1>
         <p className="text-[#8C857B] mb-8">Handles upgrades, 30-day instant refunds, and failed payments with zero shaming.</p>
         <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 text-left shadow-sm">
            <div className="flex justify-between items-center border-b border-[#EAE6DF] pb-4 mb-4">
               <div>
                  <div className="font-bold text-sm">john@example.com</div>
                  <div className="text-xs text-[#8C857B]">Requested refund (28 days ago)</div>
               </div>
               <button className="bg-[#10B981] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Approve</button>
            </div>
            <div className="flex justify-between items-center">
               <div>
                  <div className="font-bold text-sm">mary@example.com</div>
                  <div className="text-xs text-[#8C857B]">Payment failed</div>
               </div>
               <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest">7-Day Grace</span>
            </div>
         </div>
      </div>
    </main>
  );
}
`);
write('apps/hive-billing/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

// 3. Hive Docs
write('apps/hive-docs/app/page.tsx', `
"use client";
import React from 'react';

export default function HiveDocsV0() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-bold mb-4 tracking-tight">Documentation Engine</h1>
         <p className="text-gray-500 mb-8">Auto-generates FAQs and help articles from resolved support tickets.</p>
         <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">Generate Knowledge Base</button>
      </div>
    </main>
  );
}
`);
write('apps/hive-docs/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

// 4. Hive Feedback
write('apps/hive-feedback/app/page.tsx', `
"use client";
import React from 'react';

export default function HiveFeedbackV0() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-extrabold mb-4 tracking-tight">Feedback Categorization</h1>
         <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">💡</div>
               <div className="font-bold text-sm">Suggestions (14)</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">🐞</div>
               <div className="font-bold text-sm">Bugs (2)</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
               <div className="text-2xl mb-2">❤️</div>
               <div className="font-bold text-sm">Praise (45)</div>
            </div>
         </div>
      </div>
    </main>
  );
}
`);
write('apps/hive-feedback/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

console.log("Admin Cluster Engines scaffolded successfully.");
