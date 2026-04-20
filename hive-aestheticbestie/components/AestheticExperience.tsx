"use client";

import { useEffect, useState } from "react";
import AutoDemo from "@/components/AutoDemo";
import FirstVisitCard from "@/components/FirstVisitCard";
import TooltipTour from "@/components/TooltipTour";
import { fallbackAesthetic, type AestheticResult } from "@/lib/aesthetic/catalog";

type Card = AestheticResult & { source: "template" | "ai"; createdAt: number };

const welcomeKey = "hive_welcomed_hiveaestheticbestie";
const demoKey = "hive_demo_hiveaestheticbestie";
const savedKey = "hive_saved_hiveaestheticbestie";

const placeholders = [
  "I feel like a rainy Tuesday",
  "I want to look mysterious",
  "What's my vibe today",
  "I want soft but bold energy",
  "Give me cozy main-character",
];

function toCard(input: AestheticResult, source: "template" | "ai"): Card {
  return { ...input, source, createdAt: Date.now() };
}

export default function AestheticExperience() {
  const [vibe, setVibe] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [current, setCurrent] = useState<Card>(() => toCard(fallbackAesthetic(), "template"));
  const [saved, setSaved] = useState<Card[]>([]);
  const [status, setStatus] = useState("Upload a selfie or type a vibe. Then tap Find My Aesthetic.");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIndex((value) => (value + 1) % placeholders.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(savedKey);
    if (!raw) return;
    try {
      setSaved((JSON.parse(raw) as Card[]).slice(0, 6));
    } catch {
      window.localStorage.removeItem(savedKey);
    }
  }, []);

  async function generate(nextVibe?: string, nextImage?: string) {
    const activeVibe = typeof nextVibe === "string" ? nextVibe : vibe;
    const activeImage = typeof nextImage === "string" ? nextImage : imageDataUrl;

    const immediate = toCard(fallbackAesthetic(), "template");
    setCurrent(immediate);

    if (!activeVibe.trim() && !activeImage) {
      setStatus("Instant aesthetic generated.");
      return;
    }

    setBusy(true);
    setStatus("Bestie is styling your vibe...");

    try {
      const response = await fetch("/api/aesthetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: activeVibe, imageDataUrl: activeImage }),
      });

      const payload = (await response.json()) as Partial<AestheticResult> & { source?: "template" | "ai" };
      if (payload.label && payload.palette && payload.moodSentence) {
        setCurrent(toCard({
          label: payload.label,
          palette: payload.palette as [string, string, string],
          moodSentence: payload.moodSentence,
          outfitSuggestion: payload.outfitSuggestion,
        }, payload.source === "ai" ? "ai" : "template"));
      }

      setStatus(payload.source === "ai" ? "Personalized aesthetic ready." : "Template aesthetic ready.");
    } catch {
      setStatus("Template aesthetic ready.");
    } finally {
      setBusy(false);
    }
  }

  function onUpload(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setImageDataUrl(value);
    };
    reader.readAsDataURL(file);
  }

  function saveCard() {
    const next = [current, ...saved.filter((item) => item.label !== current.label || item.moodSentence !== current.moodSentence)].slice(0, 6);
    setSaved(next);
    window.localStorage.setItem(savedKey, JSON.stringify(next));
    setStatus("Saved locally.");
  }

  async function shareCard() {
    const text = `My aesthetic today: ${current.label} | ${current.palette.join(" ")} | ${current.moodSentence}`;
    if (navigator.share) {
      await navigator.share({ title: "HiveAestheticBestie", text, url: window.location.href }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <FirstVisitCard storageKey={welcomeKey} />
      <AutoDemo storageKey={demoKey} onFinish={(demoInput) => { setVibe(demoInput); void generate(demoInput, ""); }} />
      <main className="shell">
        <header className="top">
          <div>
            <p className="label">Instant aesthetic reflection</p>
            <div className="wordmark">HIVE <span>AESTHETIC BESTIE</span></div>
          </div>
          <TooltipTour />
        </header>

        <section className="grid">
          <article className="card input-card">
            <h1>Find your vibe in one tap.</h1>
            <p>Feels like being seen by your best friend. Upload a selfie, type your vibe, or do both.</p>

            <div className="upload">
              <label htmlFor="selfie">Upload selfie (optional)</label>
              <input id="selfie" type="file" accept="image/*" onChange={(event) => onUpload(event.target.files?.[0])} />
              {imageDataUrl ? <img className="preview" src={imageDataUrl} alt="Selfie preview" /> : null}
            </div>

            <textarea
              className="vibe-input"
              value={vibe}
              onChange={(event) => setVibe(event.target.value)}
              placeholder={placeholders[placeholderIndex]}
              aria-label="Describe your vibe"
            />

            <div className="examples">
              <span>{placeholders[placeholderIndex]}</span>
            </div>

            <button className="primary" type="button" onClick={() => void generate()} disabled={busy}>
              {busy ? "Styling..." : "Find My Aesthetic"}
            </button>
            <p className="status">{status}</p>
          </article>

          <article className="card result-card">
            <div>
              <p className="label">Aesthetic card</p>
              <h2>{current.label}</h2>
            </div>

            <div className="palette">
              {current.palette.map((color) => (
                <div className="swatch" key={color}>
                  <div className="swatch-color" style={{ background: color }} />
                  <div className="swatch-code">{color}</div>
                </div>
              ))}
            </div>

            <p className="mood">{current.moodSentence}</p>
            {current.outfitSuggestion ? <p className="outfit">Outfit: {current.outfitSuggestion}</p> : null}

            <div className="actions">
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="chip" type="button" onClick={saveCard}>Save</button>
                <button className="chip" type="button" onClick={() => void shareCard()}>Share</button>
                <button className="chip" type="button" onClick={() => void generate()}>Try again</button>
              </div>
              <p className="status">{copied ? "Copied." : current.source === "ai" ? "Personalized" : "Instant"}</p>
            </div>
          </article>
        </section>

        {saved.length > 0 ? (
          <section className="saved">
            <p className="label">Saved aesthetics</p>
            {saved.map((item) => (
              <article key={`${item.createdAt}-${item.label}`} className="saved-item">
                <strong>{item.label}</strong>
                <p>{item.moodSentence}</p>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}