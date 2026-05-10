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
        <p className="eyebrow">HivePlainScan</p>
        <h1>Your Compliance Audit, secured by the Hive.</h1>
        <p className="lede">
          Paste, upload, or photograph a finalized imaging report. Get a clear
          summary, a finding-by-finding breakdown, questions to bring to your
          doctor, and a downloadable PDF. No diagnosis. No jargon. Free,
          forever.
        </p>
      </header>

      

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
          <div className="mt-8 mb-4 font-bold text-lg">Control Gap Analysis</div><FindingsTable findings={result.findings} />
          <div className="mt-8 mb-4 font-bold text-lg">Required Remediation Steps</div><DoctorQuestions questions={result.questionsForDoctor} />
          <div className="mt-8 mb-4 font-bold text-lg">Critical Security Vulnerabilities</div><RedFlagBox redFlags={result.redFlags} />
          <ReportExport result={result} />
          <Disclaimer text={result.disclaimer} />
        </>
      )}

      {!result && !loading && !error && <Disclaimer />}
      <PhilanthropicFooter />
    </main>
  );
}
