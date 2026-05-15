"use client";

import { useState, useEffect, useCallback } from "react";

type BrandTier = "budget" | "mid" | "premium";

type TemplateItem = {
  name: string;
  quantity: number;
  unit: string | null;
  brand_tier: BrandTier;
  perishable: boolean;
  substitution_allowed: boolean;
};

type Template = {
  id: string;
  user_id: string;
  name: string;
  items: TemplateItem[];
  cadence: string | null;
  created_at: string;
  updated_at: string;
};

type NewItem = {
  name: string;
  quantity: number;
  unit: string;
  brand_tier: BrandTier;
  perishable: boolean;
  substitution_allowed: boolean;
};

function emptyItem(): NewItem {
  return { name: "", quantity: 1, unit: "", brand_tier: "mid", perishable: false, substitution_allowed: true };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  userId: string;
  onRunCart: (templateId: string) => void;
};

export default function MyLists({ userId, onRunCart }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [items, setItems] = useState<NewItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/hbs/templates?user_id=${userId}`);
    const data = await res.json();
    setTemplates(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchTemplates();
  }, [userId, fetchTemplates]);

  function openNewForm() {
    setEditId(null);
    setFormName("");
    setItems([emptyItem()]);
    setShowForm(true);
  }

  function openEditForm(t: Template) {
    setEditId(t.id);
    setFormName(t.name);
    setItems(
      t.items.length > 0
        ? t.items.map((i) => ({ ...i, unit: i.unit ?? "" }))
        : [emptyItem()]
    );
    setShowForm(true);
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof NewItem, value: unknown) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  async function saveTemplate() {
    if (!formName.trim() || items.length === 0) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      name: formName.trim(),
      items: items.map((i) => ({ ...i, unit: i.unit || null })),
    };
    await fetch("/api/hbs/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setShowForm(false);
    fetchTemplates();
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this list?")) return;
    await fetch(`/api/hbs/templates/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    fetchTemplates();
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">My Shopping Lists</span>
        <button className="btn-primary" onClick={openNewForm}>
          + Add New List
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "2rem" }}>🛒</div>
          <p>No lists yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="hbs-grid">
          {templates.map((t) => (
            <div key={t.id} className="template-card">
              <div>
                <div className="template-card-name">{t.name}</div>
                <div className="template-card-meta">
                  {t.items.length} item{t.items.length !== 1 ? "s" : ""} · updated {formatDate(t.updated_at)}
                </div>
              </div>
              <div className="template-card-actions">
                <button
                  className="btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => onRunCart(t.id)}
                >
                  Run this cart
                </button>
                <button
                  className="btn-ghost"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => openEditForm(t)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                  onClick={() => deleteTemplate(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="inline-form">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{editId ? "Edit List" : "New List"}</h3>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>✕</button>
          </div>

          <div>
            <label className="hbs-label">List Name</label>
            <input
              className="hbs-input"
              placeholder="e.g. Weekly Groceries"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div>
            <label className="hbs-label">Items</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {items.map((item, idx) => (
                <div key={idx} className="hbs-card-sm">
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1.1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input
                      className="hbs-input"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                    />
                    <input
                      className="hbs-input"
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Number(e.target.value) || 1)}
                    />
                    <input
                      className="hbs-input"
                      placeholder="Unit (optional)"
                      value={item.unit}
                      onChange={(e) => updateItem(idx, "unit", e.target.value)}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "0.5rem", alignItems: "center" }}>
                    <select
                      className="hbs-select"
                      value={item.brand_tier}
                      onChange={(e) => updateItem(idx, "brand_tier", e.target.value as BrandTier)}
                    >
                      <option value="budget">Budget</option>
                      <option value="mid">Mid</option>
                      <option value="premium">Premium</option>
                    </select>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={item.perishable}
                        onChange={(e) => updateItem(idx, "perishable", e.target.checked)}
                      />
                      Perishable
                    </label>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={item.substitution_allowed}
                        onChange={(e) => updateItem(idx, "substitution_allowed", e.target.checked)}
                      />
                      Allow sub
                    </label>
                    {items.length > 1 && (
                      <button className="btn-danger" onClick={() => removeItem(idx)} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost" onClick={addItem} style={{ marginTop: "0.5rem", width: "100%", fontSize: "0.85rem" }}>
              + Add item
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={saveTemplate}
              disabled={saving || !formName.trim() || items.every((i) => !i.name.trim())}
            >
              {saving ? "Saving…" : "Save List"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
