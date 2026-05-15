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
      setUpgradeToast("🎉 Welcome to your new plan! Your limits have been updated.");
      setUsageRefresh((n) => n + 1);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("upgrade_cancelled") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const refreshUsage = useCallback(() => {
    setUsageRefresh((n) => n + 1);
  }, []);

  function handleRunCart(templateId: string) {
    setRunTemplateId(templateId);
    setTab("run");
  }

  return (
    <div className="hbs-shell">
      <header className="hbs-header">
        <div>
          <div className="hbs-wordmark">
            Hive<span>BuyStuff</span>
          </div>
          <div className="hbs-tagline">Build once. Run anywhere.</div>
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

      {upgradeToast && (
        <div
          style={{
            background: "rgba(63,185,80,0.1)",
            border: "1px solid rgba(63,185,80,0.35)",
            borderRadius: 8,
            padding: "0.65rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "var(--green)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{upgradeToast}</span>
          <button
            onClick={() => setUpgradeToast("")}
            style={{ background: "transparent", border: "none", color: "var(--green)", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {userId && (
        <>
          <FirstVisitCard onTryIt={() => setTab("lists")} />
          <AutoDemo />
          <UsageBanner userId={userId} refreshTrigger={usageRefresh} />
        </>
      )}

      <nav className="hbs-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "lists"}
          className={`hbs-tab${tab === "lists" ? " active" : ""}`}
          onClick={() => setTab("lists")}
        >
          My Lists
        </button>
        <button
          role="tab"
          aria-selected={tab === "run"}
          className={`hbs-tab${tab === "run" ? " active" : ""}`}
          onClick={() => setTab("run")}
        >
          Run a Cart
        </button>
        <button
          role="tab"
          aria-selected={tab === "settings"}
          className={`hbs-tab${tab === "settings" ? " active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </nav>

      {userId && (
        <>
          {tab === "lists" && (
            <MyLists userId={userId} onRunCart={handleRunCart} />
          )}
          {tab === "run" && (
            <RunCart userId={userId} initialTemplateId={runTemplateId} onRunComplete={refreshUsage} />
          )}
          {tab === "settings" && <Settings userId={userId} />}
        </>
      )}

      {showTour && (
        <TooltipTour tab={tab} onClose={() => setShowTour(false)} />
      )}

      <footer className="hbs-footer">
        <span>No ads. No investors. No agenda.</span>
        <span>·</span>
        <a href="https://hive.baby" style={{ color: "inherit", textDecoration: "none" }}>
          A Hive Engine
        </a>
      </footer>
    </div>
  );
}
