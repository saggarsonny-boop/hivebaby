"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveMicV0() {
  const [micState, setMicState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [transcript, setTranscript] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const handleMicTap = () => {
    if (micState === 'idle') {
      setMicState('listening');
      // Simulate real-time speech to text
      setTimeout(() => {
        setMicState('processing');
        setTimeout(() => {
          setTranscript("This is a demonstration of the PREQB Clarity Layer smoothing your speech...");
          setMicState('idle');
          alert("Copied to clipboard!");
        }, 800);
      }, 2000);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsPremium(true);
      alert("Redirecting to Stripe... Payment Successful! HiveMic premium unlocked for $1/month.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans relative">
      <nav className="w-full px-8 py-6 flex justify-between items-center z-20">
         <div className="font-sans font-bold tracking-tight text-xl text-amber-500 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            HiveMic
         </div>
         <div className="flex gap-4">
            {!isPremium && (
               <button onClick={handleCheckout} className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
                 Upgrade to Pro ($1/mo)
               </button>
            )}
            {isPremium && (
               <span className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                 Pro Active
               </span>
            )}
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-center z-10 animate-fade-in relative">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          The perfect default microphone.
        </h1>
        <p className="text-xl text-gray-500 mb-16 font-light max-w-2xl mx-auto">
          One button. Speak. Instant clarity. No settings. No modes. Zero friction. 
          Universal STT powered by the PREQB Clarity Layer.
        </p>

        {/* Demo Field */}
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[150px] flex items-center justify-center text-gray-400 text-lg relative mb-12">
           {transcript ? <span className="text-gray-800">{transcript}</span> : "Tap the floating mic and start speaking..."}
        </div>
      </div>

      {/* Floating Microbubble UI */}
      <div className="fixed bottom-12 right-12 z-50 flex items-center justify-center">
         <button 
           onClick={handleMicTap}
           className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border
             ${micState === 'idle' ? 'bg-white border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500' : ''}
             ${micState === 'listening' ? 'bg-amber-500 border-amber-500 text-white mic-listening' : ''}
             ${micState === 'processing' ? 'bg-amber-100 border-amber-300 text-amber-600' : ''}
           `}
         >
           {micState === 'idle' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>}
           {micState === 'listening' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>}
           {micState === 'processing' && <div className="flex gap-1"><span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span><span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span></div>}
         </button>
      </div>

      <div className="mt-auto"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
