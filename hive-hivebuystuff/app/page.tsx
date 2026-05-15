"use client";

import { useState, useEffect, useCallback } from "react";
import MyLists from "@/components/MyLists";
import RunCart from "@/components/RunCart";
import Settings from "@/components/Settings";
import TooltipTour from "@/components/TooltipTour";
import FirstVisitCard from "@/components/FirstVisitCard";
import AutoDemo from "@/components/AutoDemo";
import UsageBanner from "@/components/UsageBanner";

type Tab = "lists" | "run" | "settings";

const BACKENDS = [
  { name: "Walmart", emoji: "🛒", color: "#0071CE" },
  { name: "Target", emoji: "🎯", color: "#CC0000" },
  { name: "Amazon", emoji: "📦", color: "#FF9900" },
  { name: "Instacart", emoji: "🥦", color: "#43B02A" },
  { name: "Kroger", emoji: "🏪", color: "#006DB7" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Build your list", desc: "Add items with brand tier (budget/mid/premium), substitution rules, and dietary flags. Once." },
  { step: "2", title: "Pick your store", desc: "Walmart, Target, Amazon, Instacart, or Kroger. AI knows each store's products." },
  { step: "3", title: "Open your cart", desc: "We map every item to the exact real product at that store and hand you a ready cart." },
];

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anon";
  let uid = localStorage.getItem("hbs_user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("hbs_user_id", uid);
  }
  return uid;
}

export default function HiveBuyStuffPage() {
  const [tab, setTab] = useState<Tab>("lists");
  const [userId, setUserId] = useState<string>("");
  const [runTemplateId, setRunTemplateId] = useState<string>("");
  const [showTour, setShowTour] = useState(false);
  const [usageRefresh, setUsageRefresh] = useState(0);
  const [upgradeToast, setUpgradeToast] = useState("");

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      setUpgradeToast("🎉 Welcome to your new plan! Limits updated.");
      setUsageRefresh((n) => n + 1);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("upgrade_cancelled") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const refreshUsage = useCallback(() => setUsageRefresh((n) => n + 1), []);

  function handleRunCart(templateId: string) {
    setRunTemplateId(templateId);
    setTab("run");
  }

  return (
    <div className="hbs-shell">
      {/* Engine wordmark */}
      <header className="hbs-header">
        <div>
          <div className="hbs-wordmark">
            Hive<span>BuyStuff</span>
          </div>
          <div className="hbs-tagline">Build once. Buy anywhere.</div>
        </div>
        <button
          className="btn-ghost"
          onClick={() => setShowTour(true)}
          style={{ fontSize: "0.8rem" }}
          aria-label="Help tour"
        >
          ? Help
        </button>
      </header>

      {/* Upgrade success toast */}
      {upgradeToast && (
        <div style={{ background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.35)", borderRadius: 8, padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: "0.9rem", color: "var(--green)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{upgradeToast}</span>
          <button onClick={() => setUpgradeToast("")} style={{ background: "transparent", border: "none", color: "var(--green)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
      )}

      {/* Onboarding & usage */}
      {userId && (
        <>
          <FirstVisitCard onTryIt={() => setTab("lists")} />
          <AutoDemo />
          <UsageBanner userId={userId} refreshTrigger={usageRefresh} />
        </>
      )}

      {/* Backend showcase — always visible above tabs */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
          Shops on
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {BACKENDS.map((b) => (
            <button
              key={b.name}
              onClick={() => setTab("run")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text)",
                fontSize: "0.82rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = b.color;
                (e.currentTarget as HTMLButtonElement).style.background = `${b.color}18`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface)";
              }}
              aria-label={`Shop on ${b.name}`}
            >
              <span>{b.emoji}</span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works — shown only to first-timers (pre-dismissal) */}
      {!userId && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {HOW_IT_WORKS.map((h) => (
            <div key={h.step} className="hbs-card-sm" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.06em" }}>STEP {h.step}</div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{h.title}</div>
              <div style={{ color: "var(--text-soft)", fontSize: "0.82rem", lineHeight: 1.5 }}>{h.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <nav className="hbs-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "lists"} className={`hbs-tab${tab === "lists" ? " active" : ""}`} onClick={() => setTab("lists")}>My Lists</button>
        <button role="tab" aria-selected={tab === "run"} className={`hbs-tab${tab === "run" ? " active" : ""}`} onClick={() => setTab("run")}>Run a Cart</button>
        <button role="tab" aria-selected={tab === "settings"} className={`hbs-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
      </nav>

      {userId && (
        <>
          {tab === "lists" && <MyLists userId={userId} onRunCart={handleRunCart} />}
          {tab === "run" && <RunCart userId={userId} initialTemplateId={runTemplateId} onRunComplete={refreshUsage} />}
          {tab === "settings" && <Settings userId={userId} />}
        </>
      )}

      {showTour && <TooltipTour tab={tab} onClose={() => setShowTour(false)} />}
    </div>
  );
}
