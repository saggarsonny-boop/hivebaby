"use client";

import { useState, useEffect, useCallback } from "react";

type SubTolerance = "strict" | "flexible" | "auto";
const BACKENDS = ["Walmart", "Target", "Amazon", "Instacart", "DoorDash"] as const;

type Prefs = {
  budget_ceiling: number | null;
  substitution_tolerance: SubTolerance;
  preferred_backends: string[];
  dietary_rules: string[];
};

type Props = { userId: string };

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
    <div style={{ maxWidth: 520 }}>
      <div className="hbs-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="settings-group">
          <label className="hbs-label">Budget ceiling (optional)</label>
          <input
            className="hbs-input"
            type="number"
            min={0}
            placeholder="e.g. 150"
            value={prefs.budget_ceiling ?? ""}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                budget_ceiling: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Leave blank for no limit
          </span>
        </div>

        <div className="settings-group">
          <label className="hbs-label">Substitution tolerance</label>
          {(["strict", "flexible", "auto"] as SubTolerance[]).map((t) => (
            <label key={t} className="radio-row">
              <input
                type="radio"
                name="sub_tolerance"
                value={t}
                checked={prefs.substitution_tolerance === t}
                onChange={() => setPrefs((p) => ({ ...p, substitution_tolerance: t }))}
              />
              <span style={{ textTransform: "capitalize" }}>{t}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {t === "strict" && "— exact items only, no swaps"}
                {t === "flexible" && "— allow cheaper alternatives"}
                {t === "auto" && "— AI decides based on context"}
              </span>
            </label>
          ))}
        </div>

        <div className="settings-group">
          <label className="hbs-label">Preferred backends</label>
          {BACKENDS.map((b) => (
            <label key={b} className="settings-row">
              <input
                type="checkbox"
                checked={prefs.preferred_backends.includes(b)}
                onChange={() => toggleBackend(b)}
              />
              {b}
            </label>
          ))}
        </div>

        <div className="settings-group">
          <label className="hbs-label">Dietary rules</label>
          <input
            className="hbs-input"
            placeholder="e.g. gluten-free, no pork, low-sodium"
            value={dietaryInput}
            onChange={(e) => setDietaryInput(e.target.value)}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Comma-separated. Applied to all carts.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn-primary" onClick={savePrefs} disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && <span className="save-notice">✓ Saved</span>}
        </div>

        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1rem" }}>
          <label className="hbs-label">Your user ID</label>
          <div
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              wordBreak: "break-all",
            }}
          >
            {userId}
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            Stored in your browser. Clears if you clear localStorage.
          </span>
        </div>
      </div>
    </div>
  );
}
