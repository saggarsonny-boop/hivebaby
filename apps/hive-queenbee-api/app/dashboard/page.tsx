"use client";

import { useState, useEffect } from "react";
import PhilanthropicFooter from "@/components/PhilanthropicFooter";

export default function QueenBeeDashboard() {
  const [credits, setCredits] = useState<{ allowed: boolean; tier: string; creditsUsed: number; maxCredits: number } | null>(null);

  useEffect(() => {
    fetch("/api/me").then(res => res.json()).then(data => setCredits(data));
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">QueenBee API Dashboard</h1>
      <p className="text-[#243b53] mb-8">Secure your LLM wrappers with the Hive's central governance layer.</p>

      {credits && credits.allowed === false && (
        <div className="mb-8 p-6 rounded-lg border border-[#fca5a5] bg-[#fef2f2] shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-[#b91c1c] text-lg">Compute Allocation Exhausted</h3>
          <p className="text-[#991b1b]">
            You have exhausted your free compute allocation. Analyzing complex data requires heavy API usage which costs the Hive real money. 
            To protect our systems from bankruptcy, we must pause your processing.
          </p>
          <p className="text-[#991b1b]">
            If this tool has earned a place in your day, please support the Hive below to unlock unlimited compute access.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="https://buy.stripe.com/test_123" className="bg-[#b91c1c] text-white px-6 py-2 rounded-md font-semibold text-sm hover:bg-[#991b1b] transition-colors">$1.99 per month</a>
            <a href="https://buy.stripe.com/test_456" className="border border-[#b91c1c] text-[#b91c1c] px-6 py-2 rounded-md font-semibold text-sm hover:bg-[#fef2f2] transition-colors">$19 per year</a>
          </div>
        </div>
      )}


      

      <div className="p-6 rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Integration Guide</h2>
        <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto">
{"curl -X POST https://hive-queenbee-api.vercel.app/api/v1/moderate -H 'Authorization: Bearer sk_live_qb_...' -H 'Content-Type: application/json' -d '{\"prompt\": \"Generate a summary.\"}'"}
        </pre>
      </div>
      <PhilanthropicFooter />
    </main>
  );
}
