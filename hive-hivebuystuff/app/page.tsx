"use client";

import { useState, useEffect } from "react";
import MyLists from "@/components/MyLists";
import RunCart from "@/components/RunCart";
import Settings from "@/components/Settings";
import TooltipTour from "@/components/TooltipTour";

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

  useEffect(() => {
    setUserId(getOrCreateUserId());
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
            <RunCart userId={userId} initialTemplateId={runTemplateId} />
          )}
          {tab === "settings" && <Settings userId={userId} />}
        </>
      )}

      {showTour && (
        <TooltipTour tab={tab} onClose={() => setShowTour(false)} />
      )}
    </div>
  );
}
