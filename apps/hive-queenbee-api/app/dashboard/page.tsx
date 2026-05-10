"use client";

import { useState, useEffect } from "react";

export default function QueenBeeDashboard() {
  const [credits, setCredits] = useState<{ allowed: boolean; tier: string; creditsUsed: number; maxCredits: number } | null>(null);

  useEffect(() => {
    fetch("/api/me").then(res => res.json()).then(data => setCredits(data));
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">QueenBee API Dashboard</h1>
      <p className="text-[#243b53] mb-8">Secure your LLM wrappers with the Hive's central governance layer.</p>

      {credits && (
        <div className="mb-8 p-6 rounded-lg border border-[#e2e8f0] bg-white shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#1E3A8A] uppercase text-xs tracking-wider">Current Plan: {credits.tier}</h3>
              <p className="text-[#243b53] font-medium mt-1">API Requests Used: {credits.creditsUsed} / {credits.tier === "free" ? credits.maxCredits : "Unlimited"}</p>
            </div>
            {credits.tier === "free" && (
              <div className="flex gap-3">
                <a href="https://buy.stripe.com/test_123_pro" className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#1d4ed8]">Upgrade to Pro ($0.005/req)</a>
                <a href="https://buy.stripe.com/test_123_premium" className="border border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#eff6ff]">Premium ($2000)</a>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Your API Key</h4>
            <code className="text-xs bg-gray-200 p-1 rounded">sk_live_qb_8f92j3kf0293jf0293j</code>
          </div>
        </div>
      )}

      <div className="p-6 rounded-lg border border-[#e2e8f0] bg-white shadow-sm">
        <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Integration Guide</h2>
        <pre className="bg-slate-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto">
{"curl -X POST https://hive-queenbee-api.vercel.app/api/v1/moderate -H 'Authorization: Bearer sk_live_qb_...' -H 'Content-Type: application/json' -d '{\"prompt\": \"Generate a summary.\"}'"}
        </pre>
      </div>
    </main>
  );
}
