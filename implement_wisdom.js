const fs = require('fs');
const path = require('path');

const write = (relPath, content) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
};

console.log("Scaffolding HiveWisdom (The Longevity Engine)...");

write('apps/hive-wisdom/app/page.tsx', `
"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveWisdomV0() {
  const [view, setView] = useState<'home' | 'legacy' | 'synthesis'>('home');

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2C3E50] flex flex-col font-sans">
       
       <nav className="w-full p-8 flex justify-between items-center z-20 border-b border-[#EAE6DF]">
         <div className="font-serif tracking-widest uppercase text-sm font-bold text-[#7F8C8D]">HiveWisdom</div>
         <div className="text-xs uppercase tracking-[0.2em] text-[#D35400] font-bold px-4 py-1.5 border border-[#D35400]/30 rounded-full bg-[#D35400]/5">
            The Third Act Engine
         </div>
      </nav>

      {view === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
           <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6 text-[#2C3E50]">Map your next twenty years.</h1>
           <p className="text-[#7F8C8D] text-xl max-w-2xl mb-12 leading-relaxed">
             Retirement is a relic. You have decades of vitality and accumulated pattern recognition. 
             This engine helps you distill your wisdom, design your legacy, and architect a multi-phase future.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
              <div onClick={() => setView('legacy')} className="cursor-pointer bg-white border border-[#EAE6DF] p-10 rounded-2xl shadow-sm hover:shadow-md hover:border-[#D35400]/30 transition-all group">
                 <div className="text-4xl mb-4">🌳</div>
                 <h2 className="text-2xl font-serif mb-2 group-hover:text-[#D35400] transition-colors">Legacy Blueprint</h2>
                 <p className="text-[#7F8C8D] text-sm leading-relaxed">Extract the core patterns and principles from your career. Transform them into a teachable framework or a capstone project.</p>
              </div>
              <div onClick={() => setView('synthesis')} className="cursor-pointer bg-white border border-[#EAE6DF] p-10 rounded-2xl shadow-sm hover:shadow-md hover:border-[#D35400]/30 transition-all group">
                 <div className="text-4xl mb-4">🧭</div>
                 <h2 className="text-2xl font-serif mb-2 group-hover:text-[#D35400] transition-colors">Vitality Synthesis</h2>
                 <p className="text-[#7F8C8D] text-sm leading-relaxed">Map your physical, cognitive, and relational capital. Design an intentional structure for the years 60 to 90.</p>
              </div>
           </div>
        </div>
      )}

      {view === 'legacy' && (
        <div className="flex-1 flex flex-col items-center p-12 bg-white animate-fade-in">
           <div className="w-full max-w-3xl">
              <button onClick={() => setView('home')} className="text-[#7F8C8D] text-sm font-bold uppercase tracking-widest mb-8 hover:text-[#2C3E50] transition-colors">← Back</button>
              <h2 className="text-4xl font-serif mb-4 text-[#2C3E50]">The Crucible</h2>
              <p className="text-[#7F8C8D] mb-12">Describe the hardest professional or personal crisis you ever navigated. We will extract the universal principle hidden within it.</p>
              
              <textarea 
                 placeholder="e.g., In 1998, my company lost its biggest client. I had to let go of half the team, but we survived by pivoting to..."
                 className="w-full h-64 bg-[#FDFBF7] border border-[#EAE6DF] p-6 rounded-2xl text-lg outline-none focus:border-[#D35400]/50 transition-colors resize-none mb-8"
              />
              <button className="w-full bg-[#2C3E50] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
                Extract Principle
              </button>
           </div>
        </div>
      )}

      {view === 'synthesis' && (
        <div className="flex-1 flex flex-col items-center p-12 bg-white animate-fade-in">
           <div className="w-full max-w-3xl text-center">
              <h2 className="text-4xl font-serif mb-6">Vitality Mapping</h2>
              <p className="text-[#7F8C8D] mb-12">Identify your primary anchors for the next decade.</p>
              
              <div className="grid grid-cols-3 gap-6 mb-12">
                 <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#EAE6DF]">
                    <h3 className="font-bold mb-2">Relational</h3>
                    <p className="text-sm text-[#7F8C8D]">Who requires your stewardship?</p>
                 </div>
                 <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#EAE6DF]">
                    <h3 className="font-bold mb-2">Cognitive</h3>
                    <p className="text-sm text-[#7F8C8D]">What complex puzzle are you solving?</p>
                 </div>
                 <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#EAE6DF]">
                    <h3 className="font-bold mb-2">Structural</h3>
                    <p className="text-sm text-[#7F8C8D]">How is your wealth deployed?</p>
                 </div>
              </div>

              <button className="bg-[#D35400] text-white px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#A04000] transition-colors shadow-lg shadow-[#D35400]/20">
                Generate 10-Year Framework
              </button>
           </div>
        </div>
      )}

      <div className="mt-auto border-t border-[#EAE6DF]"><HiveFooter /></div>

      <style jsx global>{\`
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      \`}</style>
    </main>
  );
}
`);
write('apps/hive-wisdom/app/layout.tsx', `
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
`);

console.log("HiveWisdom scaffolded successfully.");
