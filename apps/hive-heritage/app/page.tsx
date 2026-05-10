"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveHeritage() {
  const [isPro, setIsPro] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const traditions = [
    { id: "hindu", title: "Hindu Rituals", icon: "🪔" },
    { id: "jewish", title: "Jewish Traditions", icon: "🕍" },
    { id: "muslim", title: "Muslim Prayers", icon: "🕌" },
    { id: "sikh", title: "Sikh Practices", icon: "🪯" },
    { id: "buddhist", title: "Buddhist Chants", icon: "☸️" },
    { id: "language", title: "Language Basics", icon: "🗣️" }
  ];

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setResponse("");
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setResponse(getSimulatedResponse(query));
    }, 1200);
  };

  const handleTopicSelect = (topicTitle: string) => {
    setSelectedTradition(topicTitle);
    setQuery(`I want to learn about ${topicTitle}`);
    setResponse("");
  };

  const getSimulatedResponse = (q: string) => {
    const lowerQ = q.toLowerCase();
    
    if (lowerQ.includes("hindu") || lowerQ.includes("puja")) {
      return "A Puja is a prayer ritual performed to host, honor, or worship one or more deities, or to spiritually celebrate an event. It often involves offering light, flowers, and water or food to the divine. You don't need to be perfect to perform it; the intention (Bhav) is what matters most. A simple daily practice might just be lighting a diya (lamp) and taking a moment of quiet reflection.";
    }
    if (lowerQ.includes("jewish") || lowerQ.includes("shabbat")) {
      return "Shabbat is the Jewish day of rest, beginning at sundown on Friday and ending at nightfall on Saturday. It is welcomed by lighting two candles, usually done by the women of the household, followed by blessings over wine (Kiddush) and bread (Challah). It is a time to disconnect from the week's labor and reconnect with family, community, and spirit.";
    }
    if (lowerQ.includes("muslim") || lowerQ.includes("salah") || lowerQ.includes("prayer")) {
      return "Salah (or Salat) is the obligatory Muslim prayer, performed five times a day. Before praying, one performs Wudu (ablution) to physically and spiritually purify themselves. The prayers involve specific physical movements—standing, bowing, and prostrating—which align the body and mind in submission to God. It is perfectly okay if you are learning the steps slowly.";
    }

    return "Thank you for asking. Heritage is a journey, and there is no shame in learning the traditions of your ancestors at your own pace. Many people feel disconnected from their roots, but every small step—whether learning a single word, understanding a holiday, or practicing a simple ritual—is a powerful act of reconnection.";
  };

  const handleProUpgrade = () => {
    setIsPro(true);
    alert("Upgraded to Pro! Heritage Preservation, Multi-Generational Linking, and Dialect Dictionaries are now unlocked.");
  };

  return (
    <main className="min-h-screen heritage-bg text-[#111827] flex flex-col font-sans items-center pt-12 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl w-full px-6 mb-8 text-center animate-slide-in">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wide mb-4 border border-amber-200">
           NO SHAME LEFT BEHIND
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
           Reconnect with your <span className="text-amber-600">Heritage.</span>
        </h1>
        <p className="text-slate-600 text-lg md:text-xl font-medium">
          A shame-free space to learn the rituals, traditions, and languages of your culture. No judgment. No expectations.
        </p>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-3xl px-6 flex flex-col gap-6 flex-1 mb-12 relative z-10 animate-slide-in" style={{animationDelay: '0.1s'}}>
         
         {/* Question Input */}
         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100 p-2 transition-all focus-within:shadow-[0_8px_30px_rgb(217,119,6,0.1)] focus-within:border-amber-300">
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2 relative">
               <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="I want to understand..." 
                  className="w-full bg-transparent text-slate-800 text-lg rounded-2xl px-6 py-4 outline-none placeholder:text-slate-400"
               />
               <button 
                  type="submit" 
                  disabled={!query}
                  className="mx-2 mb-2 sm:mx-0 sm:mb-0 bg-amber-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  Learn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </form>
         </div>

         {/* Suggested Topics (Pills) */}
         {!response && !loading && (
           <div className="mt-4">
             <p className="text-xs font-bold text-amber-800/60 uppercase tracking-wider mb-3 px-2">Cultural Pillars</p>
             <div className="flex flex-wrap gap-2">
               {traditions.map((t) => (
                 <button 
                    key={t.id}
                    onClick={() => handleTopicSelect(t.title)}
                    className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-amber-200/50 px-4 py-2 rounded-xl text-sm font-medium text-amber-900 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm"
                 >
                   <span>{t.icon}</span> {t.title}
                 </button>
               ))}
             </div>
           </div>
         )}

         {/* Output Area */}
         {loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-sm border border-amber-100 p-8 mt-4 animate-pulse">
               <div className="h-4 bg-amber-50 rounded w-1/4 mb-6"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-amber-50 rounded w-full"></div>
                 <div className="h-4 bg-amber-50 rounded w-full"></div>
                 <div className="h-4 bg-amber-50 rounded w-5/6"></div>
               </div>
            </div>
         )}

         {response && !loading && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-amber-100 p-8 mt-4 animate-slide-in">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-100/50">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  </div>
                  <h3 className="font-bold text-amber-900">Heritage Clarity</h3>
               </div>
               
               <div className="prose prose-amber max-w-none prose-p:leading-relaxed prose-p:text-amber-900/80 text-lg">
                  <p>{response}</p>
               </div>

               <div className="mt-8 pt-6 border-t border-amber-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-amber-700/60 max-w-sm">This is an educational space. We honor all traditions.</p>
                  <button onClick={() => {setResponse(""); setQuery("");}} className="text-sm font-bold text-amber-700 hover:text-amber-900">Explore another topic</button>
               </div>
            </div>
         )}

      </div>

      {/* Pro Tier Upsell */}
      {!isPro && (
        <div className="w-full max-w-3xl px-6 mt-8 z-10">
           <div className="bg-gradient-to-br from-amber-900 to-amber-950 rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-amber-800/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h2 className="text-2xl font-bold text-amber-50 mb-2">Heritage <span className="text-amber-400">Family Pass</span></h2>
                    <p className="text-amber-200/80 text-sm max-w-md">
                      Gift this engine to your children or grandchildren. Unlock multi-generational accounts, deep-dive pronunciations, and family recipe vaults.
                    </p>
                    <ul className="mt-4 space-y-2">
                       <li className="flex items-center gap-2 text-sm text-amber-200/90"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Multi-Generational Linking</li>
                       <li className="flex items-center gap-2 text-sm text-amber-200/90"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Native Audio Pronunciations</li>
                       <li className="flex items-center gap-2 text-sm text-amber-200/90"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Diaspora Community Forums (Private)</li>
                    </ul>
                 </div>
                 
                 <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                    <div className="text-3xl font-bold text-white mb-1">$30<span className="text-sm font-normal text-amber-300/70">/yr</span></div>
                    <button onClick={handleProUpgrade} className="w-full bg-amber-500 text-amber-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors shadow-lg">
                       Gift Access
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="mt-auto w-full max-w-3xl px-6 pt-12 relative z-10">
         <HiveFooter />
      </div>

    </main>
  );
}
