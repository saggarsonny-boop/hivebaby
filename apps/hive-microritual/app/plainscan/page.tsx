"use client";

import { useState, useEffect } from "react";
import ReportInput from "@/components/ReportInput";
import ResultsSummary from "@/components/ResultsSummary";
import FindingsTable from "@/components/FindingsTable";
import DoctorQuestions from "@/components/DoctorQuestions";
import RedFlagBox from "@/components/RedFlagBox";
import IllustrationDisplay from "@/components/IllustrationDisplay";
import ReportExport from "@/components/ReportExport";
import Disclaimer from "@/components/Disclaimer";
import type {
import PhilanthropicFooter from "@/components/PhilanthropicFooter";
  ExplainPayload,
  ExplainRequestBody,
  ExplainResult,
} from "@/types/plainscan";

const GENERIC_ERROR =
  "Something went wrong. Please check your report and try again.";

export default function PlainScanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [credits, setCredits] = useState<{ allowed: boolean; tier: string; creditsUsed: number; maxCredits: number } | null>(null);

  useEffect(() => {
    fetch("/api/me").then(res => res.json()).then(data => setCredits(data));
  }, []);

  const submit = async (payload: ExplainRequestBody) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: ExplainPayload | null = null;
      try {
        data = (await res.json()) as ExplainPayload;
      } catch {
        setError(GENERIC_ERROR);
        return;
      }

      if (!res.ok) {
        const message =
          data && "error" in data && typeof data.error === "string"
            ? data.error
            : GENERIC_ERROR;
        setError(message);
        return;
      }

      if (data && "error" in data) {
        setError(data.error);
        return;
      }

      if (data) {
        setResult(data);
      }
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
      fetch("/api/me").then(res => res.json()).then(data => setCredits(data));
    }
  };

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">HiveMicroritual</p>
        <h1>Your Microritual analysis, in plain English.</h1>
        <p className="lede">
          Paste, upload, or photograph a finalized imaging report. Get a clear
          summary, a finding-by-finding breakdown, questions to bring to your
          doctor, and a downloadable PDF. No diagnosis. No jargon. Free,
          forever.
        </p>
      </header>

      
        </div>
      )}

      
        
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

      <ReportInput onSubmit={submit} disabled={loading} />}

      {loading && (
        <div className="section" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Reading your report...
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <>
          <ResultsSummary result={result} />
          <IllustrationDisplay result={result} />
          <div className="mt-8 mb-4 font-bold text-lg">Habit-Stacking Opportunities</div><FindingsTable findings={result.findings} />
          <div className="mt-8 mb-4 font-bold text-lg">Suggested Micro-Rituals</div><DoctorQuestions questions={result.questionsForDoctor} />
          <div className="mt-8 mb-4 font-bold text-lg">Friction Points & Failure Catalysts</div><RedFlagBox redFlags={result.redFlags} />
          <ReportExport result={result} />
          <Disclaimer text={result.disclaimer} />
        </>
      )}

      {!result && !loading && !error && <Disclaimer />}
      <PhilanthropicFooter />
    </main>
  );
}
