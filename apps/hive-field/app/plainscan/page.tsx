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
        <p className="eyebrow">HiveField</p>
        <h1>Your Field analysis, in plain English.</h1>
        <p className="lede">
          Paste, upload, or photograph a finalized imaging report. Get a clear
          summary, a finding-by-finding breakdown, questions to bring to your
          doctor, and a downloadable PDF. No diagnosis. No jargon. Free,
          forever.
        </p>
      </header>

      {credits && (
        <div className="mx-auto max-w-4xl mb-8 p-4 rounded-lg border border-[#e2e8f0] bg-white shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1E3A8A] uppercase text-xs tracking-wider">Plan: {credits.tier}</h3>
            <p className="text-[#243b53] font-medium mt-1">Credits Used: {credits.creditsUsed} / {credits.tier === "free" ? credits.maxCredits : "Unlimited"}</p>
          </div>
          {credits.tier === "free" && (
            <div className="flex gap-3">
              <a href="https://buy.stripe.com/test_123_pro" className="bg-[#2563eb] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#1d4ed8]">Upgrade to Pro ($15)</a>
              <a href="https://buy.stripe.com/test_123_premium" className="border border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#eff6ff]">Premium ($45)</a>
            </div>
          )}
        </div>
      )}

      {credits && !credits.allowed ? (
        <div className="mx-auto max-w-4xl p-8 rounded-lg bg-red-50 border border-red-200 text-center">
          <h2 className="text-xl font-bold text-red-800">Credit Limit Exhausted</h2>
          <p className="mt-2 text-red-600">You have used all {credits.maxCredits} free credits. Please upgrade your plan to continue using the engine.</p>
        </div>
      ) : (
        <ReportInput onSubmit={submit} disabled={loading} />
      )}

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
          <FindingsTable findings={result.findings} />
          <DoctorQuestions questions={result.questionsForDoctor} />
          <RedFlagBox redFlags={result.redFlags} />
          <ReportExport result={result} />
          <Disclaimer text={result.disclaimer} />
        </>
      )}

      {!result && !loading && !error && <Disclaimer />}
    </main>
  );
}
