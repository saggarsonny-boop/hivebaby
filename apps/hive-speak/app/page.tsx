"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveSpeakV0() {
  const [activeTab, setActiveTab] = useState<'mri' | 'fictional' | 'indigenous' | 'dialects'>('mri');
  const [isPremium, setIsPremium] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsPremium(true);
      alert("Redirecting to Stripe... Payment Successful! HiveSpeak premium (Global & Fictional Language Packs) unlocked.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <nav className="w-full px-8 py-6 flex justify-between items-center z-20 bg-white border-b border-gray-100 shadow-sm">
         <div className="font-sans font-black tracking-tighter text-2xl text-blue-600">
            HiveSpeak
         </div>
         <div className="flex gap-4">
            {!isPremium && (
               <button onClick={handleCheckout} className="text-sm font-bold text-white bg-blue-600 px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                 Unlock Full Library ($1/yr)
               </button>
            )}
            {isPremium && (
               <span className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2 rounded-xl border border-blue-100">
                 Universal Access Active
               </span>
            )}
         </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-start p-8 max-w-5xl mx-auto w-full animate-fade-in pt-12">
        <div className="text-center w-full mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 mb-4">
            The Universal Language Substrate.
          </h1>
          <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
            Accents. Dialects. Fictional Languages. Indigenous Preservation. 
            Speak to the world.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 mb-8 overflow-x-auto max-w-full">
           <button onClick={() => setActiveTab('mri')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mri' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Language MRI</button>
           <button onClick={() => setActiveTab('dialects')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dialects' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Dialects & Accents</button>
           <button onClick={() => setActiveTab('indigenous')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'indigenous' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Indigenous Preservation</button>
           <button onClick={() => setActiveTab('fictional')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'fictional' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Fictional</button>
        </div>

        {/* Content Area */}
        <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
          
          {activeTab === 'mri' && (
             <div className="animate-fade-in grid md:grid-cols-2 gap-8">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">Instant Accent Diagnosis</h2>
                   <p className="text-slate-500 text-sm mb-6">Speak one sentence, and HiveSpeak maps your phonemes, vowel space, and intonation contour to build a personalized curriculum.</p>
                   <button className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      Tap to Speak
                   </button>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center items-center opacity-50">
                   <div className="w-full h-32 bg-slate-200 rounded-xl animate-pulse mb-4"></div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Audio Input</span>
                </div>
             </div>
          )}

          {activeTab === 'dialects' && (
             <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Dialect Morphing & Slang</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 bg-white border border-slate-200 rounded-xl hive-card cursor-pointer"><h3 className="font-bold text-slate-700">British RP</h3><span className="text-xs text-slate-500">Accent Module</span></div>
                   <div className="p-4 bg-white border border-slate-200 rounded-xl hive-card cursor-pointer"><h3 className="font-bold text-slate-700">Singlish</h3><span className="text-xs text-slate-500">Dialect Module</span></div>
                   <div className="p-4 bg-white border border-slate-200 rounded-xl hive-card cursor-pointer"><h3 className="font-bold text-slate-700">Gen Z</h3><span className="text-xs text-slate-500">Slang Pack</span></div>
                   <div className="p-4 bg-white border border-slate-200 rounded-xl hive-card cursor-pointer relative overflow-hidden">
                      {!isPremium && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center"><span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded">LOCKED</span></div>}
                      <h3 className="font-bold text-slate-700">Levantine</h3><span className="text-xs text-slate-500">Arabic Dialect</span>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'indigenous' && (
             <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Equal, not exotic.</h2>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">Preservation Priority</span>
                </div>
                <p className="text-slate-500 text-sm mb-8 max-w-xl">
                  Reconstruct grammar, generate examples, create pronunciation models, and preserve oral traditions globally.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                   <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                     <h3 className="font-bold text-slate-700 mb-1">Māori (Te Reo)</h3>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3"><div className="bg-green-500 w-3/4 h-1.5 rounded-full"></div></div>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                     <h3 className="font-bold text-slate-700 mb-1">Navajo (Diné)</h3>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3"><div className="bg-green-500 w-1/2 h-1.5 rounded-full"></div></div>
                   </div>
                   <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                     <h3 className="font-bold text-slate-700 mb-1">Inuktitut</h3>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3"><div className="bg-green-500 w-1/4 h-1.5 rounded-full"></div></div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'fictional' && (
             <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Conlangs & Fictional</h2>
                <p className="text-slate-500 text-sm mb-6">Because language should be joyous. Viral hooks powered by the universal substrate.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl hive-card cursor-pointer">
                      <span className="text-2xl mb-2 block">🖖</span>
                      <h3 className="font-bold text-indigo-900">Klingon</h3>
                   </div>
                   <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl hive-card cursor-pointer relative overflow-hidden">
                      {!isPremium && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center"><span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded">PRO</span></div>}
                      <span className="text-2xl mb-2 block">🧝‍♂️</span>
                      <h3 className="font-bold text-emerald-900">Sindarin (Elvish)</h3>
                   </div>
                   <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl hive-card cursor-pointer relative overflow-hidden">
                      {!isPremium && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center"><span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded">PRO</span></div>}
                      <span className="text-2xl mb-2 block">🐉</span>
                      <h3 className="font-bold text-rose-900">High Valyrian</h3>
                   </div>
                   <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl hive-card cursor-pointer relative overflow-hidden">
                      {!isPremium && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center"><span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded">PRO</span></div>}
                      <span className="text-2xl mb-2 block">🤖</span>
                      <h3 className="font-bold text-slate-900">Binary (R2-D2)</h3>
                   </div>
                </div>
             </div>
          )}

        </div>
      </div>

      <div className="mt-auto"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
