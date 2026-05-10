"use client";

import React, { useState, useEffect } from 'react';
import HiveFooter from "@/components/HiveFooter";

const SEED_SECRETS = [
  "I lied to my partner about money.",
  "I fantasize about leaving everything behind.",
  "I wish I had told my father I loved him.",
  "I'm terrified I'll never be enough.",
  "I cheated on an exam and still feel guilty.",
  "I don't know who I am anymore.",
  "I feel invisible in my own family.",
  "I resent my children sometimes, and it kills me to admit it.",
  "I stayed in a relationship for five years just because I was afraid of being alone.",
  "I pretend to be happy, but I cry in my car on the way home from work every day."
];

export default function SecretBoxV0() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [hideSexual, setHideSexual] = useState(true);
  const [hideViolent, setHideViolent] = useState(true);
  
  const [view, setView] = useState('drop'); // 'drop', 'receive'
  const [mySecret, setMySecret] = useState('');
  const [receivedSecret, setReceivedSecret] = useState('');

  // Setup initial gate
  if (!ageConfirmed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl text-center">
          <h1 className="text-3xl font-serif text-white mb-6">Secret Box</h1>
          <p className="text-gray-400 mb-8 font-light tracking-wide text-sm">
            This is a safe, anonymous space. Before you enter, we need to know your age.
          </p>
          <p className="text-lg text-gray-200 mb-6">Are you 18 or older?</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setIsOver18(true); setHideSexual(false); setAgeConfirmed(true); }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              Yes
            </button>
            <button 
              onClick={() => { setIsOver18(false); setHideSexual(true); setAgeConfirmed(true); }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleDrop = () => {
    if (!mySecret.trim()) return;
    // In a real app, this goes to the DB.
    // For V0, we just show a random seed secret.
    handleSeeAnother();
    setView('receive');
    setMySecret('');
  };

  const handleSeeAnother = () => {
    const randomIdx = Math.floor(Math.random() * SEED_SECRETS.length);
    setReceivedSecret(SEED_SECRETS[randomIdx]);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Settings Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-end gap-6 text-sm text-gray-400">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={hideSexual} 
            onChange={(e) => isOver18 && setHideSexual(e.target.checked)}
            disabled={!isOver18}
            className="accent-white"
          />
          Hide sexual content
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={hideViolent} 
            onChange={(e) => setHideViolent(e.target.checked)}
            className="accent-white"
          />
          Hide violent content
        </label>
      </div>

      <div className="z-10 text-center max-w-2xl w-full mt-12 mb-auto pt-20">
        <h1 className="text-5xl font-serif text-white tracking-wider mb-2 opacity-90">Secret Box</h1>
        <p className="text-gray-500 mb-16 font-light tracking-widest text-sm uppercase">Anonymous • Untraceable</p>

        {view === 'drop' ? (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <textarea 
              value={mySecret}
              onChange={(e) => setMySecret(e.target.value)}
              placeholder="Drop a secret..."
              className="w-full h-64 bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl outline-none resize-none placeholder-gray-600 focus:border-gray-600 transition-colors font-serif text-xl"
            />
            <button 
              onClick={handleDrop}
              disabled={!mySecret.trim()}
              className="mt-8 bg-white text-black px-12 py-4 rounded-full font-bold tracking-wide uppercase text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Release
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-fade-in">
            <div className="w-full bg-gray-900 border border-gray-800 p-12 rounded-2xl shadow-2xl relative">
               <div className="absolute top-4 left-4 text-gray-700 font-serif text-6xl">"</div>
               <p className="text-2xl font-serif text-gray-200 leading-relaxed z-10 relative px-4">
                 {receivedSecret}
               </p>
               <div className="absolute bottom-0 right-4 text-gray-700 font-serif text-6xl rotate-180">"</div>
            </div>
            
            <div className="mt-12 flex gap-4 w-full max-w-md">
              <button 
                onClick={handleSeeAnother}
                className="flex-1 bg-gray-800 text-white px-6 py-4 rounded-full font-bold tracking-wide text-sm hover:bg-gray-700 transition-colors"
              >
                See Another
              </button>
              <button 
                onClick={() => setView('drop')}
                className="flex-1 bg-white text-black px-6 py-4 rounded-full font-bold tracking-wide text-sm hover:bg-gray-200 transition-colors"
              >
                Drop Another
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full mt-auto pt-12">
        <HiveFooter />
      </div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}