"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveCartV0() {
  const [list, setList] = useState('');

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col p-6 font-sans relative">
       <nav className="w-full flex justify-between items-center z-20 mb-12">
         <div className="font-serif tracking-widest uppercase text-sm font-bold text-gray-400">HiveCart</div>
         <div className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold px-4 py-1.5 border border-emerald-900/50 rounded-full bg-emerald-900/20">
            Universal Procurement Overlay
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto">
         <div className="text-center mb-12">
            <h1 className="text-5xl font-serif tracking-tight mb-4">Don't shop. Just list.</h1>
            <p className="text-gray-400 text-lg">We map your list to the cheapest carts across Walmart, Amazon, and Target automatically.</p>
         </div>

         <div className="w-full relative">
            <textarea 
              value={list}
              onChange={(e) => setList(e.target.value)}
              placeholder="Paste your weekly list here... (e.g. 2x Oat Milk, Paper Towels, Chicken Breast)"
              className="w-full h-64 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl outline-none focus:border-emerald-500 transition-colors resize-none text-lg"
            />
            
            <button className="absolute bottom-6 right-6 bg-emerald-500 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
              Build Carts Automatically
            </button>
         </div>

         <div className="mt-12 flex gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">✓ No API Keys Needed</div>
            <div className="flex items-center gap-2">✓ Zero Friction</div>
            <div className="flex items-center gap-2">✓ Sovereign Routing</div>
         </div>
      </div>

      <div className="mt-auto pt-12"><HiveFooter /></div>
    </main>
  );
}