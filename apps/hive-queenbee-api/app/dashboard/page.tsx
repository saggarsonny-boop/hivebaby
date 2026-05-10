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
