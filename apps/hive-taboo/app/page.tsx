"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveTaboo() {
  const [isPro, setIsPro] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const topics = [
    { id: "anatomy_m", title: "Penis Anatomy & Physiology", icon: "🧬" },
    { id: "anatomy_f", title: "Vulva & Vagina Anatomy", icon: "🌸" },
    { id: "variation", title: "Body Variation & Normalcy", icon: "🔍" },
    { id: "arousal", title: "Arousal & Sexual Function", icon: "⚡" },
    { id: "masturbation", title: "Masturbation Clarity", icon: "🧘" },
    { id: "puberty", title: "Puberty & Development", icon: "🌱" }
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
    setSelectedTopic(topicTitle);
    setQuery(`Tell me about ${topicTitle}`);
    setResponse("");
  };

  const getSimulatedResponse = (q: string) => {
    const lowerQ = q.toLowerCase();
    
    if (lowerQ.includes("masturbation")) {
      return "Masturbation is a normal part of human development across all cultures and ages. It is self-stimulation for comfort, curiosity, stress relief, or pleasure. It is not a disorder, not a sign of pathology, and not a moral indicator. Medically, it does not cause blindness, infertility, or mental illness—these are historical myths. Neurologically, it releases dopamine, oxytocin, and endorphins, which is why it often acts as a self-soothing or stress-reduction mechanism.";
    }
    if (lowerQ.includes("variation") || lowerQ.includes("normal")) {
      return "Biological variation is enormous. Just like faces, noses, and hands, genital anatomy (labia size/symmetry, penis curve/girth, breast shape) varies widely. There is no single 'normal' look. Medical professionals see enormous variation—the public simply doesn't, which is why media representations often create false standards. Asymmetry and distinct coloration are entirely common physiological realities.";
    }
    if (lowerQ.includes("penis")) {
      return "The penis is a complex vascular and neurological organ. Biologically, its size is influenced by androgen exposure during fetal development, not adult body proportions (like foot size). Flaccid size varies highly with temperature, stress, and hydration due to smooth muscle contraction. Age-related changes in appearance are normal and involve changes in skin elasticity and subcutaneous fat, which do not necessarily impact function.";
    }
    if (lowerQ.includes("vulva") || lowerQ.includes("vagina")) {
      return "It's important to distinguish the vulva (external structures including labia and clitoris glans) from the vagina (internal muscular canal). The vagina is a self-cleaning organ that maintains its own pH and microbiome. It is highly elastic and changes shape, size, and angle dynamically in response to hormones, age, and arousal. Changes in elasticity are related to connective tissue and pelvic floor tone, not moral behavior.";
    }

    return "Thank you for asking. This is a shame-free space. Based on your query, the biological and anatomical reality is that human bodies exhibit wide variation. Fear and shame often arise from a lack of clear education. If you are experiencing pain or concerning symptoms, a medical evaluation is appropriate, but most variations in shape, size, and normal physiological function are completely healthy.";
  };

  const handleProUpgrade = () => {
    setIsPro(true);
    alert("Upgraded to Pro! Private Vault, Continuous Context, and 'Rarely Informed' Deep Dives are now unlocked.");
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans items-center pt-12 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl w-full px-6 mb-8 text-center animate-slide-in">
        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide mb-4">
           THE TABOO SWARM
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
           Ask Anything. <br className="md:hidden" />
           <span className="text-indigo-600">Zero Judgment.</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl">
          A sovereign, private clarity engine for the questions you can't ask anyone else. Pure biology, anatomy, and psychology. No shame. No tracking.
        </p>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-3xl px-6 flex flex-col gap-6 flex-1 mb-12 relative z-10 animate-slide-in" style={{animationDelay: '0.1s'}}>
         
         {/* Question Input */}
         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-2 transition-all focus-within:shadow-[0_8px_30px_rgb(79,70,229,0.1)] focus-within:border-indigo-200">
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2 relative">
               <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a private question about anatomy, body variation, or normalcy..." 
                  className="w-full bg-transparent text-slate-800 text-lg rounded-2xl px-6 py-4 outline-none placeholder:text-slate-400"
               />
               <button 
                  type="submit" 
                  disabled={!query}
                  className="mx-2 mb-2 sm:mx-0 sm:mb-0 bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  Get Clarity
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </form>
         </div>

         {/* Suggested Topics (Pills) */}
         {!response && !loading && (
           <div className="mt-4">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Common Clarity Topics</p>
             <div className="flex flex-wrap gap-2">
               {topics.map((t) => (
                 <button 
                    key={t.id}
                    onClick={() => handleTopicSelect(t.title)}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition-all shadow-sm"
                 >
                   <span>{t.icon}</span> {t.title}
                 </button>
               ))}
             </div>
           </div>
         )}

         {/* Output Area */}
         {loading && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mt-4 animate-pulse">
               <div className="h-4 bg-slate-100 rounded w-1/4 mb-6"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
               </div>
            </div>
         )}

         {response && !loading && (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 mt-4 animate-slide-in">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-800">Biological & Anatomical Clarity</h3>
               </div>
               
               <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-700 text-lg">
                  <p>{response}</p>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 max-w-sm">This information is educational and anatomical. It does not constitute medical diagnosis or advice.</p>
                  <button onClick={() => {setResponse(""); setQuery("");}} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Ask another question</button>
               </div>
            </div>
         )}

      </div>

      {/* Pro Tier Upsell - Fixed Bottom or Inline */}
      {!isPro && (
        <div className="w-full max-w-3xl px-6 mt-8">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Taboo Swarm <span className="text-indigo-400">Pro</span></h2>
                    <p className="text-slate-300 text-sm max-w-md">
                      Get deep-dive explanations, image analysis (processed securely on-device), and a Private Vault that never logs your queries. 
                    </p>
                    <ul className="mt-4 space-y-2">
                       <li className="flex items-center gap-2 text-sm text-slate-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Deep "Rarely Informed" Explanations</li>
                       <li className="flex items-center gap-2 text-sm text-slate-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Safe, Private Media Analysis</li>
                       <li className="flex items-center gap-2 text-sm text-slate-300"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Zero Cloud Retention (Private Vault)</li>
                    </ul>
                 </div>
                 
                 <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
                    <div className="text-3xl font-bold text-white mb-1">$10<span className="text-sm font-normal text-slate-400">/mo</span></div>
                    <button onClick={handleProUpgrade} className="w-full bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                       Unlock Pro
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="mt-auto w-full max-w-3xl px-6 pt-12">
         <HiveFooter />
      </div>

    </main>
  );
}
