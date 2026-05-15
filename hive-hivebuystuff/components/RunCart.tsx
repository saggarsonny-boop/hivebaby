"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Template = {
  id: string;
  name: string;
  items: unknown[];
};

type CartItem = {
  original: string;
  mapped: string;
  qty: number;
};

type CartResult = {
  backend: string;
  items: CartItem[];
  cart_url: string;
  notes: string;
};

const BACKENDS = ["Walmart", "Target", "Amazon", "Instacart"] as const;
type Backend = (typeof BACKENDS)[number];

type Props = {
  userId: string;
  initialTemplateId?: string;
  onRunComplete?: () => void;
};

export default function RunCart({ userId, initialTemplateId = "", onRunComplete }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);
  const [backend, setBackend] = useState<Backend>("Walmart");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CartResult | null>(null);
  const [error, setError] = useState("");
  const [extSession, setExtSession] = useState<string | null>(null);
  const [extStatus, setExtStatus] = useState<"idle" | "pending" | "executing" | "done" | "failed">("idle");
  const extPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTemplates = useCallback(async () => {
    const res = await fetch(`/api/hbs/templates?user_id=${userId}`);
    const data = await res.json();
    setTemplates(Array.isArray(data) ? data : []);
    if (initialTemplateId && !selectedTemplate) setSelectedTemplate(initialTemplateId);
  }, [userId, initialTemplateId, selectedTemplate]);

  useEffect(() => {
    if (userId) fetchTemplates();
  }, [userId, fetchTemplates]);

  useEffect(() => {
    if (initialTemplateId) setSelectedTemplate(initialTemplateId);
  }, [initialTemplateId]);

  async function buildCart() {
    if (!selectedTemplate) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/hbs/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate,
          backend: backend.toLowerCase(),
          user_id: userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.upgrade_required) {
          setError(`${err.error}. You've used ${err.run_count}/${err.limit} runs this month. Upgrade to continue.`);
        } else {
          setError(err.error ?? "Something went wrong");
        }
        return;
      }

      const data = await res.json();
      setResult(data);
      onRunComplete?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendToExtension() {
    if (!result) return;
    setExtStatus("pending");
    const res = await fetch("/api/hbs/ext/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, items: result.items, backend: result.backend }),
    });
    const data = await res.json();
    setExtSession(data.id);
    pollExtSession(data.id);
  }

  function pollExtSession(sessionId: string) {
    if (extPollRef.current) clearTimeout(extPollRef.current);
    extPollRef.current = setTimeout(async () => {
      const res = await fetch(`/api/hbs/ext/session?user_id=${userId}&session_id=${sessionId}`);
      const data = await res.json();
      if (data?.status && data.status !== "pending") {
        setExtStatus(data.status);
      } else {
        setExtStatus("pending");
        pollExtSession(sessionId);
      }
    }, 3000);
  }

  const selectedName = templates.find((t) => t.id === selectedTemplate)?.name ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="hbs-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label className="hbs-label">Select a list</label>
          <select
            className="hbs-select"
            value={selectedTemplate}
            onChange={(e) => { setSelectedTemplate(e.target.value); setResult(null); }}
          >
            <option value="">— choose a list —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.items.length} item{t.items.length !== 1 ? "s" : ""})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="hbs-label">Select a backend</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {BACKENDS.map((b) => (
              <button
                key={b}
                onClick={() => { setBackend(b); setResult(null); }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: `1px solid ${backend === b ? "var(--gold)" : "var(--border)"}`,
                  background: backend === b ? "var(--gold-dim)" : "transparent",
                  color: backend === b ? "var(--gold)" : "var(--text-soft)",
                  fontWeight: backend === b ? 600 : 400,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.15s",
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={buildCart}
            disabled={!selectedTemplate || loading}
            style={{ minWidth: "140px" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <span className="spinner" style={{ width: 14, height: 14 }} /> Building…
              </span>
            ) : (
              "Build My Cart"
            )}
          </button>
          {selectedName && !loading && (
            <span style={{ color: "var(--text-soft)", fontSize: "0.85rem" }}>
              {selectedName} → {backend}
            </span>
          )}
        </div>

        {error && (
          <div style={{ color: "var(--red)", fontSize: "0.875rem", background: "rgba(248,81,73,0.08)", borderRadius: 6, padding: "0.6rem 0.8rem" }}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="cart-result">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "space-between", flexWrap: "wrap" }}>
            <span className="cart-result-title">Cart ready</span>
            <span className="backend-badge">{result.backend}</span>
          </div>

          <div>
            <div className="hbs-label" style={{ marginBottom: "0.5rem" }}>Mapped items</div>
            <div>
              <div className="cart-item-row" style={{ fontWeight: 600, fontSize: "0.78rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                <span>Original</span>
                <span>Mapped to</span>
                <span style={{ textAlign: "right" }}>Qty</span>
              </div>
              {result.items.map((item, i) => (
                <div key={i} className="cart-item-row">
                  <span className="cart-item-original">{item.original}</span>
                  <span className="cart-item-mapped">{item.mapped}</span>
                  <span className="cart-item-qty">×{item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {result.notes && (
            <div className="cart-notes">
              <strong style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.2rem", color: "var(--gold)" }}>Note</strong>
              {result.notes}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <a href={result.cart_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
                Open Cart →
              </button>
            </a>
            <button
              className="btn-ghost"
              style={{ fontSize: "0.85rem", borderColor: extStatus === "done" ? "var(--green)" : extStatus === "failed" ? "var(--red)" : undefined }}
              onClick={sendToExtension}
              disabled={extStatus === "pending" || extStatus === "executing"}
              title="Requires HiveBuyStuff Chrome extension"
            >
              {extStatus === "idle" && "🧩 Add via extension"}
              {extStatus === "pending" && "Waiting for extension…"}
              {extStatus === "executing" && "Extension working…"}
              {extStatus === "done" && "✓ Added to cart"}
              {extStatus === "failed" && "Extension failed — retry?"}
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                const text = `🛒 ${selectedName} → ${result.backend}\n` +
                  result.items.map((i) => `  • ${i.mapped} ×${i.qty}`).join("\n") +
                  `\n\nBuilt with HiveBuyStuff — hivebuystuff.hive.baby`;
                if (navigator.share) {
                  navigator.share({ title: `My ${result.backend} cart`, text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("Cart summary copied to clipboard");
                }
              }}
            >
              Share cart
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className="empty-state">
          <p>No lists yet. Create one in the My Lists tab first.</p>
        </div>
      )}
    </div>
  );
}
