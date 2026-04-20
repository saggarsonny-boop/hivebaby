"use client";

import { useEffect, useState } from "react";

const demoInput = "I feel like a rainy Tuesday";

export default function AutoDemo({ storageKey, onFinish }: { storageKey: string; onFinish: (demoInput: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem(storageKey)) return;

    setVisible(true);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(demoInput.slice(0, index));
      if (index >= demoInput.length) {
        window.clearInterval(timer);
        onFinish(demoInput);
        window.setTimeout(() => {
          window.localStorage.setItem(storageKey, "1");
          setVisible(false);
        }, 8000);
      }
    }, 70);

    return () => window.clearInterval(timer);
  }, [onFinish, storageKey]);

  if (!visible) return null;

  return (
    <aside className="overlay demo" aria-live="polite">
      <h3>Auto Demo</h3>
      <p>{typed}</p>
    </aside>
  );
}