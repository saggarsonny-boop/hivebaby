"use client";

import { useState } from "react";

type Tab = "lists" | "run" | "settings";

type Step = {
  title: string;
  body: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
};

const STEPS: Record<Tab, Step[]> = {
  lists: [
    {
      title: "My Lists",
      body: "Each list is a reusable shopping template — items you buy on a regular basis.",
      position: { top: "5rem", left: "1rem" },
    },
    {
      title: "Add New List",
      body: 'Click "+ Add New List" to create a named template. Add as many items as you need.',
      position: { top: "5rem", right: "1rem" },
    },
    {
      title: "Item controls",
      body: "Set quantity, unit, brand tier (Budget / Mid / Premium), and whether substitutions are allowed for each item.",
      position: { top: "50%", left: "1rem" },
    },
    {
      title: "Run this cart",
      body: 'Hit "Run this cart" on any list to jump to Run a Cart with that template pre-selected.',
      position: { bottom: "5rem", left: "1rem" },
    },
  ],
  run: [
    {
      title: "Run a Cart",
      body: "Select a list and a store, then hit Build My Cart. Claude Haiku maps your items to real products.",
      position: { top: "5rem", left: "1rem" },
    },
    {
      title: "Backend selection",
      body: "Choose Walmart, Target, Amazon, or Instacart. HiveBuyStuff adapts its product naming to each store.",
      position: { top: "5rem", right: "1rem" },
    },
    {
      title: "Open Cart",
      body: 'Click "Open Cart" to go to the store\'s search results with your items pre-queried. Check out in the vendor\'s own interface.',
      position: { bottom: "5rem", right: "1rem" },
    },
  ],
  settings: [
    {
      title: "Budget ceiling",
      body: "Optional. Sets a soft budget cap that Claude considers when mapping items.",
      position: { top: "5rem", left: "1rem" },
    },
    {
      title: "Substitution tolerance",
      body: "Strict = exact items only. Flexible = allow cheaper swaps. Auto = AI decides.",
      position: { top: "40%", left: "1rem" },
    },
    {
      title: "Dietary rules",
      body: "Comma-separated rules (e.g. gluten-free, no pork). Applied to every cart you build.",
      position: { bottom: "5rem", left: "1rem" },
    },
  ],
};

type Props = {
  tab: Tab;
  onClose: () => void;
};

export default function TooltipTour({ tab, onClose }: Props) {
  const steps = STEPS[tab] ?? STEPS.lists;
  const [step, setStep] = useState(0);
  const current = steps[step];

  function next() {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else onClose();
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div
      className="tooltip-overlay"
      style={current.position}
      role="dialog"
      aria-modal="true"
      aria-label="Help tour"
    >
      <div className="tooltip-title">{current.title}</div>
      <div className="tooltip-body">{current.body}</div>
      <div className="tooltip-actions">
        <span className="tooltip-progress">
          {step + 1} / {steps.length}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {step > 0 && (
            <button className="btn-ghost" onClick={prev} style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
              ←
            </button>
          )}
          <button className="btn-ghost" onClick={onClose} style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
            Skip
          </button>
          <button className="btn-primary" onClick={next} style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
            {step < steps.length - 1 ? "Next →" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
