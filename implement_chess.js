const fs = require('fs');
const path = require('path');

const write = (relPath, content) => {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
};

console.log("Scaffolding HiveChess (Clarity Chess)...");

write('apps/hive-chess/app/page.tsx', `
"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function ClarityChessV0() {
  const [view, setView] = useState<'landing' | 'board'>('landing');

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2B2A] flex flex-col font-sans">
       
       <nav className="w-full p-8 flex justify-between items-center z-20">
         <div className="font-serif tracking-widest uppercase text-sm font-bold text-[#8C857B]">Clarity Chess</div>
         <div className="text-xs uppercase tracking-[0.2em] text-[#C19B76] font-bold px-4 py-1.5 border border-[#C19B76]/50 rounded-full bg-[#C19B76]/10">
            $1 / Year • Global
         </div>
      </nav>

      {view === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
           <div className="text-6xl mb-8">♞</div>
           <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">Play without fear.</h1>
           <p className="text-[#8C857B] text-xl max-w-2xl mb-12 leading-relaxed font-light">
             No toxic chat. No rating shame. No harsh computer analysis.<br/>
             Just gentle, story-based learning and an emotionally safe environment for every player on Earth.
           </p>

           <div className="flex gap-4">
              <button onClick={() => setView('board')} className="bg-[#2D2B2A] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-xl">
                Start a Game
              </button>
           </div>
           
           <div className="mt-16 flex flex-wrap justify-center gap-8 text-[#8C857B] text-sm uppercase tracking-wider font-bold">
              <div className="flex items-center gap-2">✓ Works Offline</div>
              <div className="flex items-center gap-2">✓ No Ads</div>
              <div className="flex items-center gap-2">✓ Multilingual Lessons</div>
           </div>
        </div>
      )}

      {view === 'board' && (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-12">
           
           {/* The Board */}
           <div className="w-[400px] h-[400px] bg-[#E8DCC8] border-[8px] border-[#2D2B2A] shadow-2xl relative grid grid-cols-8 grid-rows-8">
              {/* Simple CSS Checkerboard pattern */}
              {[...Array(64)].map((_, i) => {
                 const row = Math.floor(i / 8);
                 const col = i % 8;
                 const isDark = (row + col) % 2 === 1;
                 return <div key={i} className={\`w-full h-full \${isDark ? 'bg-[#C19B76]' : 'bg-[#FDFBF7]'}\`}></div>
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl">♚</div>
           </div>

           {/* The Clarity Coach */}
           <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#E8DCC8]">
              <h3 className="font-serif text-2xl mb-4 text-[#C19B76]">Clarity Coach</h3>
              <p className="text-[#8C857B] leading-relaxed mb-6">
                "I see what you're trying to do here—you want to control the center. That's a great instinct! 
                However, moving the Knight to f3 right now might leave your pawn exposed. Would you like to try a safer developmental move?"
              </p>
              <div className="flex gap-4">
                 <button className="flex-1 bg-[#FDFBF7] border border-[#E8DCC8] text-[#2D2B2A] py-3 rounded-lg font-bold text-sm hover:bg-[#E8DCC8] transition-colors">
                   Show me why
                 </button>
                 <button className="flex-1 bg-[#2D2B2A] text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors">
                   Take move back
                 </button>
              </div>
           </div>

        </div>
      )}

      <div className="mt-auto p-6"><HiveFooter /></div>

      <style jsx global>{\`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
write('apps/hive-chess/app/layout.tsx', `
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
`);

console.log("HiveChess (Clarity Chess) scaffolded successfully.");
