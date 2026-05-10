"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveClockV0() {
  const [isPremium, setIsPremium] = useState(false);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'premium' })
      });
      const data = await res.json();
      if (data.url) {
        setIsPremium(true);
        alert("Redirecting to Stripe... Payment Successful! HiveClock premium features unlocked.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans">
       
       <nav className="w-full p-6 flex justify-between items-center z-20 border-b border-gray-200 bg-white shadow-sm">
         <div className="font-sans font-extrabold tracking-tight text-xl text-indigo-600">HiveClock.</div>
         <div className="flex gap-2">
            {!isPremium && (
               <button onClick={handleCheckout} className="text-sm font-bold px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                 Unlock Vault ($1/mo)
               </button>
            )}
            {isPremium && (
               <button className="text-sm font-bold px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg border border-indigo-100">
                 Premium Active
               </button>
            )}
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600 opacity-[0.02] blur-[100px]"></div>
          <div className="absolute top-[50%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-600 opacity-[0.02] blur-[100px]"></div>
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-4 text-indigo-900 z-10">
          Chronobiology tracking.
        </h1>
        <p className="text-xl text-gray-500 mb-10 font-light tracking-wide max-w-xl z-10">
          Protect your deep work windows. Understand your energy cycles. Take control of your daily ritual.
        </p>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 z-10 relative group">
           {!isPremium && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={handleCheckout} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">
                  Unlock with $1/mo
                </button>
              </div>
           )}
           <div className="text-5xl font-mono text-center font-bold tracking-widest text-indigo-900 mb-2">
             11:42
           </div>
           <div className="text-sm font-bold text-center text-gray-400 tracking-widest uppercase mb-8">
             Deep Work Block
           </div>

           <div className="space-y-4">
             <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center opacity-50">
                <span className="font-bold text-sm text-gray-700">Circadian Optimization</span>
                <span className="text-xs font-bold text-indigo-600">LOCKED</span>
             </div>
             <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center opacity-50">
                <span className="font-bold text-sm text-gray-700">Energy Mapping</span>
                <span className="text-xs font-bold text-indigo-600">LOCKED</span>
             </div>
             <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center opacity-50">
                <span className="font-bold text-sm text-gray-700">Ritual Triggers</span>
                <span className="text-xs font-bold text-indigo-600">LOCKED</span>
             </div>
           </div>
        </div>

      </div>

      <div className="mt-auto z-20"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
