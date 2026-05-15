"use client";

import { useState, useEffect, useCallback } from "react";

type SubTolerance = "strict" | "flexible" | "auto";
const BACKENDS = ["Walmart", "Target", "Amazon", "Instacart", "Kroger"] as const;

type Prefs = {
  budget_ceiling: number | null;
  substitution_tolerance: SubTolerance;
  preferred_backends: string[];
  dietary_rules: string[];
};

type Props = { userId: string };

const TOLERANCE_META: Record<SubTolerance, { label: string; example: string }> = {
  strict: {
    label: "Give me exactly what I asked for.",
    example: "If you asked for Organic Valley Whole Milk, you'll get exactly that — nothing cheaper substituted.",
  },
  flexible: {
    label: "Swap in cheaper alternatives if they're basically the same.",
    example: "Organic Valley at $6 → Great Value at $2.80. Same product category, different brand.",
  },
  auto: {
    label: "AI uses judgement based on the item.",
    example: "Toilet paper → generic fine. Baby formula → exact brand required. Context-aware.",
  },
};

export default function Settings({ userId }: Props) {
  const [prefs, setPrefs] = useState<Prefs>({
    budget_ceiling: null,
    substitution_tolerance: "flexible",
    preferred_backends: [],
    dietary_rules: [],
  });
  const [dietaryInput, setDietaryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchPrefs = useCallback(async () => {
    const res = await fetch(`/api/hbs/preferences?user_id=${userId}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setPrefs({
          budget_ceiling: data.budget_ceiling ?? null,
          substitution_tolerance: data.substitution_tolerance ?? "flexible",
          preferred_backends: data.preferred_backends ?? [],
          dietary_rules: data.dietary_rules ?? [],
        });
        setDietaryInput((data.dietary_rules ?? []).join(", "));
      }
    }
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchPrefs();
  }, [userId, fetchPrefs]);

  function toggleBackend(b: string) {
    setPrefs((p) => ({
      ...p,
      preferred_backends: p.preferred_backends.includes(b)
        ? p.preferred_backends.filter((x) => x !== b)
        : [...p.preferred_backends, b],
    }));
  }

  async function savePrefs() {
    setSaving(true);
    setSaved(false);
    const dietary = dietaryInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await fetch("/api/hbs/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...prefs, user_id: userId, dietary_rules: dietary }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!loaded) {
    return (
      <div className="empty-state">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: "1rem", color: "var(--text-soft)", fontSize: "0.88rem", lineHeight: 1.55 }}>
        These preferences are applied automatically every time you run a cart — on any store.
        Set them once and forget them.
      </div>

      <div className="hbs-card" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* Max spend */}
        <div className="settings-group">
          <label className="hbs-label">Maximum spend per shop</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--text-soft)", fontSize: "0.9rem" }}>$</span>
            <input
              className="hbs-input"
              type="number"
              min={0}
              placeholder="No limit"
              value={prefs.budget_ceiling ?? ""}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  budget_ceiling: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              style={{ maxWidth: 140 }}
            />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            AI will prioritise lower-cost options to stay under this per trip. Leave blank for no limit.
          </span>
        </div>

        {/* Substitution tolerance */}
        <div className="settings-group">
          <label className="hbs-label">How flexible are you with swaps?</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(["strict", "flexible", "auto"] as SubTolerance[]).map((t) => {
              const meta = TOLERANCE_META[t];
              const active = prefs.substitution_tolerance === t;
              return (
                <label
                  key={t}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    padding: "0.75rem 0.9rem",
                    borderRadius: 8,
                    border: `1px solid ${active ? "var(--gold-border)" : "var(--border-soft)"}`,
                    background: active ? "var(--gold-dim)" : "transparent",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <input
                      type="radio"
                      name="sub_tolerance"
                      value={t}
                      checked={active}
                      onChange={() => setPrefs((p) => ({ ...p, substitution_tolerance: t }))}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: active ? "var(--gold)" : "var(--text)", textTransform: "capitalize" }}>{t}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>{meta.label}</span>
                  </div>
                  {active && (
                    <div style={{ marginLeft: "1.6rem", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      e.g. {meta.example}
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Preferred stores */}
        <div className="settings-group">
          <label className="hbs-label">Your preferred stores</label>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Tick the stores you actually use. AI will weight mapped products accordingly.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            {BACKENDS.map((b) => (
              <label key={b} className="settings-row" style={{ padding: "0.5rem 0.75rem", borderRadius: 6, border: `1px solid ${prefs.preferred_backends.includes(b) ? "var(--gold-border)" : "var(--border-soft)"}`, background: prefs.preferred_backends.includes(b) ? "var(--gold-dim)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                <input
                  type="checkbox"
                  checked={prefs.preferred_backends.includes(b)}
                  onChange={() => toggleBackend(b)}
                />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Dietary rules */}
        <div className="settings-group">
          <label className="hbs-label">Dietary rules — applied to every cart</label>
          <input
            className="hbs-input"
            placeholder="e.g. gluten-free, no pork, low-sodium, vegan"
            value={dietaryInput}
            onChange={(e) => setDietaryInput(e.target.value)}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Comma-separated. AI filters or substitutes any item that violates a rule.
          </span>
        </div>

        {/* Save */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn-primary" onClick={savePrefs} disabled={saving}>
            {saving ? "Saving…" : "Save preferences"}
          </button>
          {saved && <span className="save-notice">✓ Saved</span>}
        </div>

        {/* Identity */}
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1rem" }}>
          <label className="hbs-label">Your session ID</label>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: "0.78rem", color: "var(--text-muted)", wordBreak: "break-all", marginBottom: "0.3rem" }}>
            {userId}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.5 }}>
            Stored in your browser. Your lists and preferences live here.
            Clearing localStorage loses them — a portable magic key is coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
