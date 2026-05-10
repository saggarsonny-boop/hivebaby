"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveIdentifyV0() {
  const [view, setView] = useState<'home' | 'journal' | 'timeline' | 'export'>('home');
  const [isPremium, setIsPremium] = useState(false);
  const [shareSessionOpen, setShareSessionOpen] = useState(false);

  const handleCheckout = async () => {
    try {
      // Simulate Stripe
      setIsPremium(true);
      alert("Redirecting to Stripe... Payment Successful! Premium sanctuary features unlocked.");
    } catch (e) {
      console.error(e);
    }
  };

  const startShareSession = () => {
    setShareSessionOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#292524] flex flex-col font-sans transition-colors duration-500">
      <nav className="w-full px-8 py-6 flex justify-between items-center z-20">
         <div className="font-sans font-light tracking-widest text-lg text-[#78716C] uppercase">
            HiveIdentify.
         </div>
         <div className="flex gap-4">
            <button onClick={() => setView('home')} className="text-sm text-[#78716C] hover:text-[#292524] transition-colors">Sanctuary</button>
            <button onClick={() => setView('journal')} className="text-sm text-[#78716C] hover:text-[#292524] transition-colors">Journal</button>
            <button onClick={() => isPremium ? setView('timeline') : handleCheckout()} className="text-sm text-[#78716C] hover:text-[#292524] transition-colors flex items-center gap-1">
               Timeline {!isPremium && <span className="text-[10px] bg-[#E7E5E4] px-1 rounded-sm">$1/yr</span>}
            </button>
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full relative z-10 animate-fade-in">
        
        {view === 'home' && (
          <div className="text-center w-full">
            <h1 className="text-4xl md:text-5xl font-serif text-[#44403C] mb-6 leading-tight">
              A private space to understand yourself.
            </h1>
            <p className="text-[#A8A29E] text-lg font-light tracking-wide mb-16 max-w-2xl mx-auto">
              No labels required. No data leaves your device. Reflect. Explore. Breathe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div onClick={() => setView('journal')} className="cursor-pointer bg-white p-8 rounded-2xl border border-[#F5F5F4] shadow-sm hover:shadow-md transition-shadow">
                 <h2 className="text-xl font-medium text-[#57534E] mb-3">Identity Reflection</h2>
                 <p className="text-[#A8A29E] text-sm leading-relaxed">
                   When do you feel most like yourself? What environments feel safe? Journal without pressure.
                 </p>
              </div>
              <div onClick={() => isPremium ? setView('timeline') : handleCheckout()} className="cursor-pointer bg-white p-8 rounded-2xl border border-[#F5F5F4] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                 {!isPremium && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="bg-[#57534E] text-white px-4 py-2 rounded-lg text-sm">Unlock Timeline ($1/yr)</span>
                   </div>
                 )}
                 <h2 className="text-xl font-medium text-[#57534E] mb-3">Identity Timeline</h2>
                 <p className="text-[#A8A29E] text-sm leading-relaxed">
                   See what you wrote last month. What changed. What stayed the same. Pattern tracking.
                 </p>
              </div>
              <div className="cursor-pointer bg-white p-8 rounded-2xl border border-[#F5F5F4] shadow-sm hover:shadow-md transition-shadow opacity-60">
                 <h2 className="text-xl font-medium text-[#57534E] mb-3">Gender Exploration</h2>
                 <p className="text-[#A8A29E] text-sm leading-relaxed">
                   Comfort patterns, expression reflections, social expectations. Non-diagnostic.
                 </p>
              </div>
              <div className="cursor-pointer bg-white p-8 rounded-2xl border border-[#F5F5F4] shadow-sm hover:shadow-md transition-shadow opacity-60">
                 <h2 className="text-xl font-medium text-[#57534E] mb-3">Orientation Exploration</h2>
                 <p className="text-[#A8A29E] text-sm leading-relaxed">
                   Attraction patterns, boundaries, comfort with labels. Clarity without definitions.
                 </p>
              </div>
            </div>
          </div>
        )}

        {view === 'journal' && (
          <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-sm border border-[#F5F5F4] animate-fade-in">
             <div className="flex justify-between items-center mb-8">
               <span className="text-sm font-bold text-[#A8A29E] tracking-widest uppercase">May 10, 2026</span>
               <button onClick={startShareSession} className="text-sm text-[#A8A29E] hover:text-[#57534E] transition-colors border border-[#E7E5E4] px-3 py-1 rounded-md">
                 Share Session
               </button>
             </div>
             <textarea 
               placeholder="I feel most like myself when..." 
               className="w-full h-64 text-lg text-[#57534E] placeholder-[#D6D3D1] focus:outline-none resize-none bg-transparent"
             />
             <div className="mt-8 flex justify-end gap-4">
                <button className="px-6 py-2 rounded-xl text-sm font-medium text-[#78716C] bg-[#F5F5F4] hover:bg-[#E7E5E4] transition-colors">Discard</button>
                <button className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-[#57534E] hover:bg-[#44403C] transition-colors">Save Locally</button>
             </div>
          </div>
        )}

        {view === 'timeline' && (
          <div className="w-full max-w-2xl text-left animate-fade-in">
             <h2 className="text-2xl font-serif text-[#44403C] mb-8">Your Identity Timeline</h2>
             <div className="space-y-6">
                <div className="pl-6 border-l-2 border-[#E7E5E4] relative pb-6">
                   <div className="absolute w-3 h-3 bg-[#A8A29E] rounded-full -left-[7px] top-1"></div>
                   <span className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest block mb-2">1 Month Ago</span>
                   <p className="text-[#57534E] italic bg-white p-4 rounded-xl border border-[#F5F5F4]">
                     "I feel this heavy expectation when I enter the classroom, like I have to perform a version of myself."
                   </p>
                </div>
                <div className="pl-6 border-l-2 border-[#E7E5E4] relative">
                   <div className="absolute w-3 h-3 bg-[#57534E] rounded-full -left-[7px] top-1"></div>
                   <span className="text-xs font-bold text-[#A8A29E] uppercase tracking-widest block mb-2">Today</span>
                   <p className="text-[#57534E] bg-white p-4 rounded-xl border border-[#F5F5F4]">
                     "The expectation is still there, but today I realized I don't actually have to meet it. That felt freeing."
                   </p>
                </div>
             </div>
             <div className="mt-12 p-6 bg-[#F5F5F4] rounded-2xl border border-[#E7E5E4]">
                <h3 className="text-sm font-bold text-[#78716C] uppercase tracking-widest mb-2">Pattern Detected</h3>
                <p className="text-[#57534E] text-sm">You frequently mention "expectations" linked to physical environments. Would you like to explore what boundaries might help?</p>
             </div>
          </div>
        )}

      </div>

      {shareSessionOpen && (
        <div className="fixed inset-0 bg-[#1C1917]/20 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-[#F5F5F4]">
            <h2 className="text-2xl font-serif text-[#44403C] mb-2">Share Session</h2>
            <p className="text-[#A8A29E] text-sm mb-6">Create a temporary, read-only link to share this reflection with a therapist, friend, or trusted adult.</p>
            
            <div className="space-y-4 mb-8">
              <select className="w-full border border-[#E7E5E4] bg-[#FAFAF9] text-[#57534E] rounded-xl p-3 text-sm focus:outline-none">
                <option>Expires in 24 Hours</option>
                <option>Expires in 1 Hour</option>
                <option>Expires in 7 Days</option>
              </select>
              <select className="w-full border border-[#E7E5E4] bg-[#FAFAF9] text-[#57534E] rounded-xl p-3 text-sm focus:outline-none">
                <option>Anonymous (No metadata)</option>
                <option>Initials Only</option>
              </select>
            </div>

            <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-4 flex justify-between items-center mb-6">
               <span className="text-xs font-mono text-[#A8A29E]">https://hiveidentify.com/s/9x2b4z</span>
               <button className="text-sm font-bold text-[#57534E] hover:text-[#292524]">Copy</button>
            </div>

            <button onClick={() => setShareSessionOpen(false)} className="w-full py-3 rounded-xl bg-[#F5F5F4] text-[#57534E] font-medium text-sm hover:bg-[#E7E5E4] transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
