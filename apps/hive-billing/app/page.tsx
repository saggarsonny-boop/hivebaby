"use client";
import React from 'react';

export default function HiveBillingV0() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2B2A] flex flex-col items-center justify-center font-sans p-6">
      <div className="text-center max-w-lg">
         <h1 className="text-3xl font-serif mb-4">Billing & Subscriptions</h1>
         <p className="text-[#8C857B] mb-8">Handles upgrades, 30-day instant refunds, and failed payments with zero shaming.</p>
         <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 text-left shadow-sm">
            <div className="flex justify-between items-center border-b border-[#EAE6DF] pb-4 mb-4">
               <div>
                  <div className="font-bold text-sm">john@example.com</div>
                  <div className="text-xs text-[#8C857B]">Requested refund (28 days ago)</div>
               </div>
               <button className="bg-[#10B981] text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Approve</button>
            </div>
            <div className="flex justify-between items-center">
               <div>
                  <div className="font-bold text-sm">mary@example.com</div>
                  <div className="text-xs text-[#8C857B]">Payment failed</div>
               </div>
               <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest">7-Day Grace</span>
            </div>
         </div>
      </div>
    </main>
  );
}