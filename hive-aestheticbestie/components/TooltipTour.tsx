"use client";

import { useState } from "react";

const steps = [
  "Upload a selfie or type your vibe. One is enough.",
  "Find My Aesthetic returns a label, palette, and mood instantly.",
  "Save stores your favorite cards locally on this device.",
  "Share copies a screenshot-ready caption for easy posting.",
];

export default function TooltipTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <button className="ghost" type="button" onClick={() => { setIndex(0); setOpen((value) => !value); }}>
        ? Tour
      </button>
      {open ? (
        <aside className="overlay tour" aria-live="polite">
          <h3>Quick Tour</h3>
          <p>{steps[index]}</p>
          <div className="overlay-actions">
            <button className="ghost" type="button" onClick={() => setOpen(false)}>Close</button>
            <button
              className="chip"
              type="button"
              onClick={() => {
                if (index === steps.length - 1) {
                  setOpen(false);
                  setIndex(0);
                  return;
                }
                setIndex((value) => value + 1);
              }}
            >
              {index === steps.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}