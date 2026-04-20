"use client";

import { useEffect, useState } from "react";

export default function FirstVisitCard({ storageKey }: { storageKey: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(storageKey));
  }, [storageKey]);

  if (!visible) return null;

  return (
    <aside className="overlay welcome" aria-live="polite">
      <h3>Seen in seconds</h3>
      <p>Try this: I want to look mysterious.</p>
      <div className="overlay-actions">
        <button
          className="chip"
          type="button"
          onClick={() => {
            window.localStorage.setItem(storageKey, "1");
            setVisible(false);
          }}
        >
          Try it
        </button>
        <button
          className="ghost"
          type="button"
          onClick={() => {
            window.localStorage.setItem(storageKey, "1");
            setVisible(false);
          }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}