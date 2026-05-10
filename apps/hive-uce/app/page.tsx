"use client";

import React, { useState, useEffect } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveUCEV0() {
  const [inputText, setInputText] = useState("");
  const [showUce, setShowUce] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [activeVoiceprint, setActiveVoiceprint] = useState("Professional");
  
  // Simulated recipient context
  const recipient = {
    name: "Alex",
    time: "2:15 AM",
    mood: "Stressed/Anxious"
  };

  useEffect(() => {
    if (inputText.length > 5) {
      setShowUce(true);
    } else {
      setShowUce(false);
    }
  }, [inputText]);

  const handleRewrite = (type: string) => {
    const rewrites: Record<string, string> = {
      'warm': "I know things are really stressful right now. I'm here for you, let's figure this out together tomorrow.",
      'clarify': "Just to clarify, we're meeting tomorrow at 10 AM, right?",
      'boundary': "I can't take this on right now, but I can look at it first thing tomorrow.",
      'professional': "I understand the urgency. I will review this in the morning and provide an update."
    };
    setInputText(rewrites[type] || inputText);
    setShowUce(false);
  };

  const handleCheckout = async () => {
    try {
      setIsPremium(true);
      alert("Redirecting to Stripe... Payment Successful! HiveUCE Premium unlocked for $1/year.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#111827] flex flex-col font-sans items-center pt-12">
      
      <div className="max-w-2xl w-full px-6 mb-8 text-center animate-slide-up">
         <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Universal Communication Engine</h1>
         <p className="text-slate-500">The planetary clarity layer. Simulating the invisible UCE overlay on a native messaging app.</p>
         
         {!isPremium && (
           <button onClick={handleCheckout} className="mt-6 text-sm font-bold text-white bg-blue-600 px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
             Activate UCE Overlay ($1/yr)
           </button>
         )}
         {isPremium && (
           <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> UCE Active Globally
           </div>
         )}
      </div>

      {/* Simulated Native App (e.g., iMessage) */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-100 relative h-[600px] flex flex-col">
         {/* Native App Header */}
         <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">A</div>
               <div>
                 <h3 className="font-bold text-slate-800 leading-tight">{recipient.name}</h3>
                 <span className="text-xs text-slate-400">Active now</span>
               </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
         </div>

         {/* Native Chat Area */}
         <div className="flex-1 bg-[#F9FAFB] p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="self-start bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 shadow-sm max-w-[80%]">
               Where is the report? I needed it yesterday. This is a mess.
            </div>
         </div>

         {/* 
            =========================================
            UCE OVERLAY INJECTION ZONE
            =========================================
         */}
         {showUce && (
            <div className="absolute bottom-24 left-4 right-4 z-50 animate-slide-up">
               {/* Context Intelligence Layer */}
               <div className="bg-white/95 uce-bubble rounded-2xl p-3 mb-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center px-1">
                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                        UCE Intelligence
                     </span>
                     
                     <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full text-xs text-slate-600 font-medium cursor-pointer hover:bg-slate-200">
                        {activeVoiceprint} Voice <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                     </div>
                  </div>

                  {/* Emotional Safety / Tone Shield */}
                  {(inputText.toLowerCase().includes('why') || inputText.toLowerCase().includes('mess') || inputText.length > 20) && (
                     <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 flex items-start gap-2">
                        <svg className="shrink-0 text-rose-500 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        <div>
                           <div className="text-xs font-bold text-rose-700">Tone Shield Alert</div>
                           <div className="text-[11px] text-rose-600 leading-tight">They sound <span className="font-bold">stressed</span>, and it's <span className="font-bold">2:15 AM</span> their time. Sending a reactive message now may escalate conflict.</div>
                        </div>
                     </div>
                  )}

                  {/* One-Tap Rewrites */}
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                     <button onClick={() => isPremium ? handleRewrite('warm') : handleCheckout()} className="shrink-0 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        Soften & Warm {!isPremium && '🔒'}
                     </button>
                     <button onClick={() => isPremium ? handleRewrite('professional') : handleCheckout()} className="shrink-0 bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        De-escalate {!isPremium && '🔒'}
                     </button>
                     <button onClick={() => isPremium ? handleRewrite('boundary') : handleCheckout()} className="shrink-0 bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        Calm Boundary {!isPremium && '🔒'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Native Input Area */}
         <div className="bg-white border-t border-gray-100 p-4 z-40 relative">
            <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-full px-4 py-2 relative">
               <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm text-slate-800 w-full"
               />
               <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </div>
         </div>
      </div>

      <div className="mt-12 w-full"><HiveFooter /></div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
