"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveCaptainV0() {
  const [view, setView] = useState<'hub' | 'navigator' | 'field'>('hub');

  return (
    <main className="min-h-screen bg-[#050A15] text-blue-50 flex flex-col font-sans">
       <nav className="w-full p-8 flex justify-between items-center border-b border-blue-900/30">
         <div className="font-serif tracking-widest uppercase text-lg font-bold text-blue-200">HiveCaptain</div>
         <div className="flex gap-4">
            <button onClick={() => setView('navigator')} className="text-xs uppercase tracking-widest text-blue-400 font-bold px-4 py-2 border border-blue-900/50 rounded hover:bg-blue-900/20 transition-colors">Navigator Pro</button>
            <button onClick={() => setView('field')} className="text-xs uppercase tracking-widest text-blue-400 font-bold px-4 py-2 border border-blue-900/50 rounded hover:bg-blue-900/20 transition-colors">Field Engine</button>
         </div>
      </nav>

      {view === 'hub' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
           <h1 className="text-5xl font-serif tracking-tight mb-6">Cognitive Sovereignty for the Helm.</h1>
           <p className="text-blue-200/60 text-xl max-w-2xl mb-12">The high-stakes operational and training substrate for aviation and maritime professionals.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <div onClick={() => setView('navigator')} className="cursor-pointer bg-[#0A1225] border border-blue-900/50 p-10 rounded-2xl hover:border-blue-500/50 transition-colors text-left group">
                 <div className="text-4xl mb-6">🧭</div>
                 <h2 className="text-2xl font-serif mb-2 group-hover:text-blue-400 transition-colors">Navigator Pro</h2>
                 <p className="text-blue-200/50 text-sm leading-relaxed">GPS-aware operational engine. Route planning, weather interpretation, and constraint matrices for live duty.</p>
              </div>
              <div onClick={() => setView('field')} className="cursor-pointer bg-[#0A1225] border border-blue-900/50 p-10 rounded-2xl hover:border-blue-500/50 transition-colors text-left group">
                 <div className="text-4xl mb-6">🌊</div>
                 <h2 className="text-2xl font-serif mb-2 group-hover:text-blue-400 transition-colors">Field Engine Pack</h2>
                 <p className="text-blue-200/50 text-sm leading-relaxed">Scenario-simulation substrate. Emergency drills, decision mapping, and CRM practice offline.</p>
              </div>
           </div>
        </div>
      )}

      {view === 'navigator' && (
        <div className="flex-1 flex flex-col items-center p-12">
           <h2 className="text-3xl font-serif text-blue-300 mb-8 w-full max-w-4xl border-b border-blue-900/30 pb-4">Navigator Pro: Pre-Flight Assessment</h2>
           <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0A1225] p-6 rounded-xl border border-blue-900/50 min-h-[400px]">
                 <p className="text-blue-200/40 font-medium">Weather + Route Telemetry Canvas</p>
              </div>
              <div className="col-span-1 flex flex-col gap-6">
                 <div className="bg-[#0A1225] p-6 rounded-xl border border-red-900/30 flex-1">
                    <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4">Risk Constraints</h3>
                    <p className="text-sm text-blue-100">Crosswinds at destination nearing 25kt limit. Alternate runway recommended.</p>
                 </div>
                 <button className="bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-500 transition-colors">
                   Generate Brief
                 </button>
              </div>
           </div>
        </div>
      )}

      {view === 'field' && (
        <div className="flex-1 flex items-center justify-center">
           <div className="max-w-2xl text-center">
              <div className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">Scenario 104</div>
              <h2 className="text-3xl font-serif mb-6 leading-relaxed">Dual engine failure at 15,000ft, heavily congested airspace, multiple terrain hazards below.</h2>
              <div className="flex gap-4 justify-center mt-8">
                 <button className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-sm font-bold transition-colors">Ditch</button>
                 <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full text-sm font-bold transition-colors">Attempt Restart</button>
                 <button className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full text-sm font-bold transition-colors">Declare Emergency & Glide</button>
              </div>
           </div>
        </div>
      )}

      <div className="mt-auto border-t border-blue-900/30"><HiveFooter /></div>
    </main>
  );
}