"use client";

import React, { useState } from 'react';
import HiveFooter from "@/components/HiveFooter";

export default function HiveTextV0() {
  const [view, setView] = useState<'home' | 'broadcast' | 'quiet_hours'>('home');
  const [isPremium, setIsPremium] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

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
        alert("Redirecting to Stripe... Payment Successful! Premium features unlocked.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareSession = () => {
    setShareLink('https://hivetext.com/share/sess_9x8f2a1');
    setShareModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans relative">
       
       <nav className="w-full p-6 flex justify-between items-center z-20 border-b border-gray-200 bg-white shadow-sm">
         <div className="font-sans font-extrabold tracking-tight text-xl text-indigo-600">HiveText.</div>
         <div className="flex gap-2">
            <button onClick={() => setView('home')} className="text-sm font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Inbox</button>
            <button onClick={() => isPremium ? setView('broadcast') : handleCheckout()} className="text-sm font-semibold px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              {isPremium ? 'Broadcast' : 'Unlock Broadcast'}
            </button>
            <button onClick={() => isPremium ? setView('quiet_hours') : handleCheckout()} className="text-sm font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
               {isPremium ? 'Quiet Hours' : 'Unlock Quiet Hours'}
            </button>
         </div>
      </nav>

      {view === 'home' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
           <h1 className="text-5xl font-extrabold tracking-tight mb-4">Humane, private texting.</h1>
           <p className="text-gray-500 text-lg max-w-xl mb-12">
             Send blind broadcasts. Set quiet hours. Let your phone protect your peace instead of interrupting it.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
              <div onClick={() => isPremium ? setView('broadcast') : handleCheckout()} className="cursor-pointer bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                 {!isPremium && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">Unlock with $1/mo</span>
                   </div>
                 )}
                 <div className="text-3xl mb-4">📣</div>
                 <h2 className="text-xl font-bold mb-2">Blind Broadcast</h2>
                 <p className="text-gray-500 text-sm">Send one message to 50 people. They reply to you privately. No group threads.</p>
              </div>
              <div onClick={() => isPremium ? setView('quiet_hours') : handleCheckout()} className="cursor-pointer bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                 {!isPremium && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">Unlock with $1/mo</span>
                   </div>
                 )}
                 <div className="text-3xl mb-4">🌙</div>
                 <h2 className="text-xl font-bold mb-2">Quiet Hours</h2>
                 <p className="text-gray-500 text-sm">Schedule auto-replies for evenings and weekends. Unplug without guilt.</p>
              </div>
           </div>
        </div>
      )}

      {view === 'broadcast' && (
        <div className="flex-1 flex flex-col items-center p-8 bg-gray-50 animate-fade-in">
           <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Broadcast</h2>
                <button onClick={handleShareSession} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                  Share Session
                </button>
              </div>
              
              <div className="mb-6">
                 <label className="block text-sm font-bold text-gray-700 mb-2">To: (Segment or Contacts)</label>
                 <div className="w-full bg-gray-100 p-3 rounded-lg border border-gray-200 text-gray-500 text-sm">
                    Select recipients... (e.g., "Volleyball Team", "Clients")
                 </div>
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                 <textarea 
                   placeholder="Type your message here..."
                   className="w-full h-40 bg-white border border-gray-300 p-4 rounded-xl text-md outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                 />
                 <div className="mt-2 text-xs text-gray-400">
                    Will append: "Sent with HiveText — private, quiet texting."
                 </div>
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                Send to 0 Recipients
              </button>
           </div>
        </div>
      )}

      {view === 'quiet_hours' && (
        <div className="flex-1 flex flex-col items-center p-8 bg-gray-50 animate-fade-in">
           <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold">Quiet Hours</h2>
                 <div className="flex gap-4">
                   <button onClick={handleShareSession} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Share Session</button>
                   <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">+ New Schedule</button>
                 </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 mb-6 relative">
                 <div className="absolute top-6 right-6">
                    <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
                       <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                    </div>
                 </div>
                 <h3 className="font-bold text-lg mb-1">Deep Work Block</h3>
                 <p className="text-sm text-gray-500 mb-4">Every Weekday • 9:00 AM - 12:00 PM</p>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 italic">
                    "I'm in a deep work session and have notifications paused. I'll get back to you this afternoon."
                 </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-6 relative">
                 <div className="absolute top-6 right-6">
                    <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
                       <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                    </div>
                 </div>
                 <h3 className="font-bold text-lg mb-1">Weekend Disconnect</h3>
                 <p className="text-sm text-gray-500 mb-4">Sat, Sun • All Day</p>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 italic">
                    "I'm unplugged for the weekend. If this is an emergency, please call. Otherwise, I'll reply on Monday."
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Share Session Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Share Session</h2>
            <p className="text-gray-500 text-sm mb-6">Generate a temporary, read-only link to share your current draft or schedule.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Expires in 1 Hour</option>
                <option>Expires in 24 Hours</option>
                <option>Expires in 7 Days</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Privacy</label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Anonymous</option>
                <option>Initials Only</option>
                <option>Full Name</option>
              </select>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex justify-between items-center">
               <span className="text-sm text-gray-600 font-mono">{shareLink}</span>
               <button className="text-indigo-600 font-bold text-sm hover:text-indigo-800">Copy</button>
            </div>

            <button 
              onClick={() => setShareModalOpen(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto"><HiveFooter /></div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}