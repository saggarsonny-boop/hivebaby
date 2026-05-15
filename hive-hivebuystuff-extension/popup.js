const API_BASE = "https://hivebuystuff.hive.baby";

const $ = (id) => document.getElementById(id);

let currentUserId = null;
let pollTimer = null;

// ── Boot ────────────────────────────────────────────────────────────────────

async function init() {
  currentUserId = await msg("GET_USER_ID");
  if (currentUserId) {
    showConnected();
    await refresh();
  } else {
    showDisconnected();
  }
}

// ── Messaging ───────────────────────────────────────────────────────────────

function msg(type, extra = {}) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage({ type, ...extra }, resolve)
  );
}

// ── UI states ───────────────────────────────────────────────────────────────

function showConnected() {
  $("status-dot").className = "dot green";
  $("status-text").textContent = "Connected";
  $("user-id-display").textContent = currentUserId;
  $("id-section").style.display = "block";
  $("link-section").style.display = "none";
  $("action-row").style.display = "flex";
}

function showDisconnected() {
  $("status-dot").className = "dot";
  $("status-text").textContent = "Not connected — enter your session ID below";
  $("user-id-display").textContent = "—";
  $("link-section").style.display = "block";
  $("id-section").style.display = "none";
  $("action-row").style.display = "none";
  $("sessions-section").style.display = "none";
  $("empty-section").style.display = "none";
}

function showLinking() {
  $("link-section").style.display = "block";
  $("id-section").style.display = "none";
  $("action-row").style.display = "none";
  $("sessions-section").style.display = "none";
  $("empty-section").style.display = "none";
}

// ── Session polling ──────────────────────────────────────────────────────────

async function refresh() {
  if (!currentUserId) return;
  $("status-dot").className = "dot gold";
  $("status-text").textContent = "Checking for carts…";

  try {
    const res = await fetch(`${API_BASE}/api/hbs/ext/session?user_id=${currentUserId}`);
    if (!res.ok) throw new Error("fetch failed");
    const sessions = await res.json();

    renderSessions(Array.isArray(sessions) ? sessions : []);
    $("status-dot").className = "dot green";
    $("status-text").textContent = "Connected";
  } catch {
    $("status-dot").className = "dot";
    $("status-text").textContent = "Could not reach HiveBuyStuff";
  }
}

function renderSessions(sessions) {
  const hasSessions = sessions.length > 0;
  $("sessions-section").style.display = hasSessions ? "flex" : "none";
  $("empty-section").style.display = hasSessions ? "none" : "block";

  const list = $("sessions-list");
  list.innerHTML = "";

  for (const s of sessions) {
    const card = document.createElement("div");
    card.className = "session-card";

    const itemCount = Array.isArray(s.items) ? s.items.length : "?";
    const statusLabel = {
      pending: "⏳ Waiting for extension",
      executing: "⚙️ Adding items…",
      done: `✓ Done — ${s.result?.added ?? 0}/${itemCount} added`,
      failed: "✗ Failed",
    }[s.status] ?? s.status;

    card.innerHTML = `
      <div class="session-store">${s.backend ?? "unknown"}</div>
      <div class="session-meta">${itemCount} item${itemCount !== 1 ? "s" : ""}</div>
      <div class="session-status ${s.status}">${statusLabel}</div>
    `;
    list.appendChild(card);
  }
}

// ── Link / change ID ─────────────────────────────────────────────────────────

async function linkId() {
  const raw = $("user-id-input").value.trim();
  if (!raw) {
    showError("Enter a session ID.");
    return;
  }
  if (raw.length < 8) {
    showError("Session ID looks too short.");
    return;
  }

  await msg("SET_USER_ID", { userId: raw });
  currentUserId = raw;
  $("user-id-input").value = "";
  hideError();
  showConnected();
  await refresh();
}

function showError(text) {
  const el = $("link-error");
  el.textContent = text;
  el.style.display = "block";
}
function hideError() {
  $("link-error").style.display = "none";
}

// ── Handlers ─────────────────────────────────────────────────────────────────

$("link-btn").addEventListener("click", linkId);

$("link-cancel-btn").addEventListener("click", () => {
  if (currentUserId) {
    showConnected();
    refresh();
  } else {
    showDisconnected();
  }
});

$("user-id-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") linkId();
});

$("change-id-btn").addEventListener("click", () => {
  showLinking();
});

$("poll-btn").addEventListener("click", async () => {
  $("poll-btn").disabled = true;
  await msg("POLL_NOW");
  await refresh();
  $("poll-btn").disabled = false;
});

// Boot
init();
