"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function OralMicrobiomeSense() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResponse("");
    setTimeout(() => {
      setLoading(false);
      setResponse("This is a shame-free educational space. " +
      "The Hive does not diagnose or prescribe. Here is general clarity regarding your question: " + 
      "It is incredibly common to have questions about this topic, and many people experience exactly what you are describing. " +
      "Biologically and socially, wide variation exists, and much of what causes anxiety is simply a lack of open education.");
    }, 1200);
  };

  return (
    <main className="min-h-screen text-[#111827] flex flex-col font-sans items-center pt-12 pb-24">
      <div className="max-w-3xl w-full px-6 mb-8 text-center animate-slide-in">
        <div className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold tracking-wide mb-4 shadow-sm">
           SHAME-FREE CLARITY
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
           Oral Ecosystem <span className="text-4xl">👄</span>
        </h1>
        <p className="text-slate-600 text-lg md:text-xl font-medium">
          A sovereign, private space for education. No judgment. No expectations.
        </p>
      </div>

      <div className="w-full max-w-3xl px-6 flex flex-col gap-6 flex-1 mb-12 relative z-10 animate-slide-in" style={{animationDelay: '0.1s'}}>
         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-2 transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2 relative">
               <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="I have a question about..." 
                  className="w-full bg-transparent text-slate-800 text-lg rounded-2xl px-6 py-4 outline-none placeholder:text-slate-400"
               />
               <button 
                  type="submit" 
                  disabled={!query}
                  className="mx-2 mb-2 sm:mx-0 sm:mb-0 bg-slate-900 text-white font-bold px-8 py-3 rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  Learn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </form>
         </div>

         {loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-8 mt-4 animate-pulse">
               <div className="h-4 bg-slate-100 rounded w-1/4 mb-6"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
               </div>
            </div>
         )}

         {response && !loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 mt-4 animate-slide-in">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-800">Educational Clarity</h3>
               </div>
               <div className="prose prose-slate max-w-none text-lg">
                  <p>{response}</p>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 max-w-sm">This is an educational space. If you are experiencing concerning symptoms or distress, please consult a professional.</p>
                  <button onClick={() => {setResponse(""); setQuery("");}} className="text-sm font-bold text-slate-600 hover:text-slate-900">Explore another topic</button>
               </div>
            </div>
         )}
      </div>

      <div className="mt-auto w-full max-w-3xl px-6 pt-12 relative z-10">
         <HiveFooter />
      </div>
    </main>
  );
}