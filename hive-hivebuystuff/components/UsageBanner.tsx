"use client";

import { useState, useEffect, useCallback } from "react";

type UsageData = {
  tier: "free" | "pro" | "premium";
  run_count: number;
  list_count: number;
  limits: { lists: number | null; runs_per_month: number | null };
  stripe_customer_id: string | null;
};

type Props = {
  userId: string;
  refreshTrigger?: number;
};

export default function UsageBanner({ userId, refreshTrigger }: Props) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<"pro" | "premium" | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  const fetchUsage = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/hbs/usage?user_id=${userId}`);
    if (res.ok) setUsage(await res.json());
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    fetchUsage();
  }, [fetchUsage, refreshTrigger]);

  async function upgrade(plan: "pro" | "premium") {
    setCheckingOut(plan);
    const res = await fetch("/api/hbs/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Could not start checkout. Please try again.");
      setCheckingOut(null);
    }
  }

  async function manageSubscription() {
    setOpeningPortal(true);
    const res = await fetch("/api/hbs/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Could not open billing portal.");
      setOpeningPortal(false);
    }
  }

  if (loading || !usage) return null;

  const { tier, run_count, limits } = usage;
  const runLimit = limits.runs_per_month;
  const runPct = runLimit ? run_count / runLimit : 0;
  const nearLimit = runPct >= 0.7;
  const atLimit = runLimit !== null && run_count >= runLimit;

  if (tier === "premium") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(63,185,80,0.07)", border: "1px solid rgba(63,185,80,0.25)", borderRadius: 8, marginBottom: "1rem", fontSize: "0.82rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "var(--green)", fontWeight: 600 }}>✓ Premium — unlimited runs</span>
        <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem" }} onClick={manageSubscription} disabled={openingPortal}>
          {openingPortal ? "Opening…" : "Manage plan"}
        </button>
      </div>
    );
  }

  if (tier === "pro") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(240,165,0,0.07)", border: "1px solid var(--gold-border)", borderRadius: 8, marginBottom: "1rem", fontSize: "0.82rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "var(--gold)", fontWeight: 600 }}>Pro plan · {run_count}/{runLimit} runs this month</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.2rem 0.7rem" }} onClick={() => upgrade("premium")} disabled={!!checkingOut}>
            {checkingOut === "premium" ? "Redirecting…" : "Go Premium"}
          </button>
          <button className="btn-ghost" style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem" }} onClick={manageSubscription} disabled={openingPortal}>
            {openingPortal ? "Opening…" : "Manage"}
          </button>
        </div>
      </div>
    );
  }

  const color = atLimit ? "var(--red)" : nearLimit ? "#f0a500" : "var(--text-muted)";
  const bg = atLimit ? "rgba(248,81,73,0.07)" : nearLimit ? "rgba(240,165,0,0.07)" : "var(--bg-surface)";
  const borderColor = atLimit ? "rgba(248,81,73,0.35)" : nearLimit ? "var(--gold-border)" : "var(--border)";

  return (
    <div style={{ padding: "0.5rem 0.75rem", background: bg, border: `1px solid ${borderColor}`, borderRadius: 8, marginBottom: "1rem", fontSize: "0.82rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color }}>
          {atLimit
            ? `✗ Run limit reached — ${run_count}/${runLimit} this month`
            : `Free tier · ${run_count}/${runLimit} cart runs this month`}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn-primary"
            style={{ fontSize: "0.78rem", padding: "0.25rem 0.7rem" }}
            onClick={() => upgrade("pro")}
            disabled={!!checkingOut}
          >
            {checkingOut === "pro" ? "Redirecting…" : "Go Pro — $4.99/mo"}
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: "0.78rem", padding: "0.25rem 0.7rem" }}
            onClick={() => upgrade("premium")}
            disabled={!!checkingOut}
          >
            {checkingOut === "premium" ? "Redirecting…" : "Premium — $9.99/mo"}
          </button>
        </div>
      </div>
      {runLimit && (
        <div style={{ marginTop: "0.4rem", height: 3, background: "var(--border)", borderRadius: 999 }}>
          <div style={{ height: "100%", width: `${Math.min(100, runPct * 100)}%`, background: color, borderRadius: 999, transition: "width 0.5s" }} />
        </div>
      )}
      {atLimit && (
        <div style={{ marginTop: "0.4rem", color: "var(--text-soft)", fontSize: "0.78rem" }}>
          Upgrade to keep using HiveBuyStuff. Pro includes 100 runs/month + unlimited lists.
        </div>
      )}
    </div>
  );
}
