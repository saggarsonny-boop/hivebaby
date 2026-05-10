const fs = require('fs');
const path = require('path');

const write = (relPath, content) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
};

console.log("Scaffolding Hive Adoption Engines...");

// 1. Hive Screenshot Engine
write('apps/hive-screenshot/app/page.tsx', `
"use client";
import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveScreenshotV0() {
  const [stage, setStage] = useState<'idle' | 'captured'>('idle');

  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans">
      <nav className="w-full p-6 flex justify-between items-center z-20 opacity-50 hover:opacity-100 transition-opacity">
        <div className="font-bold tracking-widest uppercase text-xs">Hive Capture</div>
      </nav>

      {stage === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="w-64 h-96 border-2 border-dashed border-gray-600 rounded-3xl flex items-center justify-center mb-12">
              <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Awaiting Capture</span>
           </div>
           <button onClick={() => setStage('captured')} className="bg-white text-black w-20 h-20 rounded-full border-4 border-gray-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-95 transition-transform" />
        </div>
      )}

      {stage === 'captured' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in w-full max-w-md mx-auto">
           <div className="w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mb-6">
              <div className="bg-gray-800 p-2 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">
                Auto-Cropped & Cleaned
              </div>
              <div className="p-8 text-center bg-gray-900">
                 <p className="text-lg font-serif italic text-gray-300">
                   "The universe is not made of atoms, it's made of tiny stories."
                 </p>
                 <div className="mt-4 text-xs text-indigo-400 font-bold uppercase tracking-widest">Text Extracted (OCR)</div>
              </div>
           </div>
           
           <div className="w-full grid grid-cols-2 gap-3 mb-4">
              <button className="bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors">
                Ask a Question
              </button>
              <button className="bg-gray-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors">
                Save to Library
              </button>
           </div>
           <button onClick={() => setStage('idle')} className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4">
             Dismiss
           </button>
        </div>
      )}

      <div className="mt-auto p-6"><HiveFooter /></div>

      <style jsx global>{\`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      \`}</style>
    </main>
  );
}
`);
write('apps/hive-screenshot/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

// 2. Hive Torch
write('apps/hive-torch/app/page.tsx', `
"use client";
import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveTorchV0() {
  const [isOn, setIsOn] = useState(false);
  const [mode, setMode] = useState<'standard' | 'warm' | 'sos'>('standard');

  const bgColor = isOn 
    ? mode === 'warm' ? 'bg-[#FFF3E0]' : mode === 'sos' ? 'bg-red-500 animate-pulse' : 'bg-white'
    : 'bg-black';
  const textColor = isOn && mode !== 'sos' ? 'text-black' : 'text-white';

  return (
    <main className={\`min-h-screen \${bgColor} \${textColor} flex flex-col font-sans transition-colors duration-500\`}>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
         
         <button 
           onClick={() => setIsOn(!isOn)} 
           className={\`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 \${isOn ? 'bg-black text-white shadow-[0_0_100px_rgba(255,255,255,0.8)]' : 'bg-gray-900 text-gray-500 shadow-none border border-gray-800'}\`}
         >
            <span className="text-4xl">{isOn ? '💡' : '🔦'}</span>
         </button>
         
         <div className="mt-16 flex gap-4 bg-gray-900/50 backdrop-blur-lg p-2 rounded-2xl border border-gray-800/50">
            <button onClick={() => setMode('standard')} className={\`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors \${mode === 'standard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}\`}>Clear</button>
            <button onClick={() => setMode('warm')} className={\`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors \${mode === 'warm' ? 'bg-[#FFB74D] text-black' : 'text-gray-400 hover:text-white'}\`}>Warm</button>
            <button onClick={() => setMode('sos')} className={\`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors \${mode === 'sos' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}\`}>SOS</button>
         </div>

      </div>

      <div className="mt-auto p-6 opacity-50"><HiveFooter /></div>
    </main>
  );
}
`);
write('apps/hive-torch/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

// 3. Hive Ingredients
write('apps/hive-ingredients/app/page.tsx', `
"use client";
import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveIngredientsV0() {
  const [view, setView] = useState<'scan' | 'preferences' | 'result'>('scan');

  return (
    <main className="min-h-screen bg-[#F0FDF4] text-[#166534] flex flex-col font-sans">
      
      <nav className="w-full p-6 flex justify-between items-center bg-white shadow-sm">
        <div className="font-bold tracking-tight text-xl">Clarity Scanner</div>
        <button onClick={() => setView('preferences')} className="text-sm font-bold bg-[#DCFCE7] px-4 py-2 rounded-full hover:bg-[#BBF7D0] transition-colors">Preferences</button>
      </nav>

      {view === 'scan' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="w-64 h-64 bg-white rounded-3xl shadow-xl border-4 border-dashed border-[#86EFAC] flex items-center justify-center cursor-pointer hover:border-[#22C55E] transition-colors" onClick={() => setView('result')}>
              <span className="text-4xl">📷</span>
           </div>
           <p className="mt-8 font-bold uppercase tracking-widest text-sm opacity-60">Tap to Scan Label</p>
        </div>
      )}

      {view === 'preferences' && (
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full animate-fade-in">
           <h2 className="text-2xl font-bold mb-2">Your Preferences</h2>
           <p className="text-sm opacity-70 mb-8">We will highlight ingredients based on these preferences. This is not medical advice.</p>
           
           <div className="flex flex-col gap-3 mb-8">
              <label className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#DCFCE7]">
                 <input type="checkbox" defaultChecked className="w-5 h-5 text-[#22C55E]" />
                 <span className="font-bold text-sm">Avoid Peanuts</span>
              </label>
              <label className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#DCFCE7]">
                 <input type="checkbox" defaultChecked className="w-5 h-5 text-[#22C55E]" />
                 <span className="font-bold text-sm">Avoid High Sodium</span>
              </label>
              <label className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#DCFCE7]">
                 <input type="checkbox" className="w-5 h-5 text-[#22C55E]" />
                 <span className="font-bold text-sm">Avoid Dairy</span>
              </label>
           </div>
           
           <button onClick={() => setView('scan')} className="bg-[#166534] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#14532D] transition-colors mt-auto">
             Save & Return
           </button>
        </div>
      )}

      {view === 'result' && (
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full animate-fade-in">
           <button onClick={() => setView('scan')} className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6">← Scan Another</button>
           
           <div className="bg-white rounded-2xl shadow-xl border border-[#FCA5A5] p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-[#FEF2F2] text-[#EF4444] rounded-full flex items-center justify-center font-bold text-xl">!</div>
                 <h2 className="text-xl font-bold text-[#991B1B]">Caution Advised</h2>
              </div>
              <p className="text-sm text-[#991B1B] leading-relaxed">
                 This product contains <span className="font-bold underline">sodium nitrate</span> and <span className="font-bold underline">sea salt</span>. You indicated that you prefer to avoid high-sodium foods.
              </p>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-[#DCFCE7] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-3">All Ingredients</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                 Filtered Water, Organic Soybeans, <span className="bg-[#FEF2F2] text-[#991B1B] font-bold px-1 rounded">Sea Salt</span>, Organic Alcohol, <span className="bg-[#FEF2F2] text-[#991B1B] font-bold px-1 rounded">Sodium Nitrate</span>.
              </p>
           </div>
        </div>
      )}

      <div className="mt-auto p-6"><HiveFooter /></div>

      <style jsx global>{\`
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      \`}</style>
    </main>
  );
}
`);
write('apps/hive-ingredients/app/layout.tsx', `import "./globals.css"; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }`);

console.log("Hive Adoption Engines scaffolded successfully.");
