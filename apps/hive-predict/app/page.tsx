"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HivePredictV0() {
  const [view, setView] = useState<'list' | 'detail' | 'tree' | 'crowd'>('list');
  const [isPremium, setIsPremium] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsPremium(true);
      alert("Redirecting to Stripe... Payment Successful! HivePredict Premium (Unlimited Scenarios) unlocked for $1/year.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans">
      <nav className="w-full px-8 py-6 flex justify-between items-center z-20 border-b border-white/5">
         <div className="font-sans font-light tracking-widest text-lg text-amber-500 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l8 4.5v9L12 22l-8-4.5v-9L12 2z"/><path d="M4 6.5l8 4.5 8-4.5"/><path d="M12 11v11"/></svg>
            HivePredict
         </div>
         <div className="flex gap-4">
            <button onClick={() => setView('list')} className="text-sm text-slate-400 hover:text-white transition-colors">Forecasts</button>
            <button onClick={() => setView('crowd')} className="text-sm text-slate-400 hover:text-white transition-colors">Sentiment</button>
            {!isPremium && (
               <button onClick={handleCheckout} className="text-sm font-bold text-slate-900 bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
                 Unlock Scenarios ($1/yr)
               </button>
            )}
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-start p-8 max-w-4xl mx-auto w-full animate-fade-in pt-12">
        
        {view === 'list' && (
          <div className="w-full animate-fade-in">
             <div className="mb-12">
               <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                 The Clarity Layer.
               </h1>
               <p className="text-lg text-slate-400 font-light max-w-2xl">
                 Probabilities. Scenarios. Sentiment. Non-monetary, 100% legal forecasting. Know what happens before you trade.
               </p>
             </div>

             <div className="space-y-4">
                <div onClick={() => setView('detail')} className="w-full bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex justify-between items-center group">
                   <div>
                     <h3 className="text-xl font-medium text-slate-200 group-hover:text-amber-400 transition-colors">Will interest rates rise next month?</h3>
                     <span className="text-sm text-slate-500 mt-1 block">Expert Consensus vs Crowd</span>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-bold text-amber-500">68%</span>
                     <span className="text-xs text-green-400 flex items-center justify-end gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg> +4% today</span>
                   </div>
                </div>
                <div onClick={() => setView('detail')} className="w-full bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex justify-between items-center group">
                   <div>
                     <h3 className="text-xl font-medium text-slate-200 group-hover:text-amber-400 transition-colors">Will Bitcoin hit $100k this year?</h3>
                     <span className="text-sm text-slate-500 mt-1 block">Crowd Sentiment Shift</span>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-bold text-amber-500">82%</span>
                     <span className="text-xs text-green-400 flex items-center justify-end gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg> +12% today</span>
                   </div>
                </div>
                <div onClick={() => setView('detail')} className="w-full bg-slate-800/40 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all flex justify-between items-center group">
                   <div>
                     <h3 className="text-xl font-medium text-slate-200 group-hover:text-amber-400 transition-colors">Will Apple release a foldable in 2026?</h3>
                     <span className="text-sm text-slate-500 mt-1 block">Supply Chain Scenarios</span>
                   </div>
                   <div className="text-right">
                     <span className="text-3xl font-bold text-amber-500">41%</span>
                     <span className="text-xs text-red-400 flex items-center justify-end gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg> -2% today</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {view === 'detail' && (
          <div className="w-full animate-fade-in">
             <button onClick={() => setView('list')} className="text-slate-400 text-sm mb-6 flex items-center gap-2 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
             </button>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <h2 className="text-3xl font-bold text-white max-w-xl">Will interest rates rise next month?</h2>
                <div className="text-right shrink-0">
                  <span className="text-5xl font-black text-amber-500">68%</span>
                  <span className="text-sm text-green-400 block mt-1">+4% in 24h</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Drivers for YES</h4>
                   <ul className="space-y-3 text-sm text-slate-300">
                     <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Inflation data hotter than expected</li>
                     <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Fed signaling restrictive policy</li>
                     <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Labor market remaining tight</li>
                   </ul>
                </div>
                <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Drivers for NO</h4>
                   <ul className="space-y-3 text-sm text-slate-300">
                     <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">•</span> Global economic slowdown fears</li>
                     <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">•</span> Election year political pressure</li>
                   </ul>
                </div>
             </div>

             <div className="flex justify-between items-center mt-12 mb-6">
                <h3 className="text-xl font-bold text-white">Scenario Tree</h3>
                <button onClick={() => isPremium ? setView('tree') : handleCheckout()} className="text-sm text-amber-500 border border-amber-500/30 px-3 py-1 rounded hover:bg-amber-500/10 transition-colors">
                  Expand Tree {!isPremium && '($1/yr)'}
                </button>
             </div>
             
             {/* Mini tree preview */}
             <div className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                   <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded">IF YES</div>
                   <div className="h-px bg-white/10 flex-1"></div>
                   <div className="text-sm text-slate-400">Equities correct 5%, Dollar strengthens</div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-bold rounded">IF NO</div>
                   <div className="h-px bg-white/10 flex-1"></div>
                   <div className="text-sm text-slate-400">Relief rally, Tech sector breakout</div>
                </div>
             </div>

             <div className="mt-12 text-center">
                <button onClick={() => setShareOpen(true)} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  Share Forecast Card
                </button>
             </div>
          </div>
        )}

        {view === 'tree' && (
          <div className="w-full animate-fade-in text-center">
             <h2 className="text-2xl font-bold text-white mb-8">Scenario Trees Unlocked</h2>
             <p className="text-slate-400 mb-8 max-w-xl mx-auto">This is where the complex branched outcome UI would render for premium users.</p>
             <button onClick={() => setView('detail')} className="text-amber-500 text-sm">Return to details</button>
          </div>
        )}

      </div>

      {/* Viral Loop Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-slate-800 border border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full relative">
            <button onClick={() => setShareOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            <h2 className="text-xl font-bold text-white mb-6">Share your forecast</h2>
            
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl border border-white/10 mb-6">
               <div className="text-xs text-amber-500 font-bold tracking-widest mb-2 uppercase">HivePredict</div>
               <div className="text-sm text-white font-medium mb-4">Will interest rates rise next month?</div>
               <div className="text-4xl font-black text-amber-500 mb-2">68%</div>
               <div className="text-xs text-slate-400">My Confidence: High</div>
            </div>

            <button className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-3">
              Share to Twitter/X
            </button>
            <button className="w-full py-3 rounded-xl bg-slate-700 text-white font-medium text-sm hover:bg-slate-600 transition-colors">
              Copy Link
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
