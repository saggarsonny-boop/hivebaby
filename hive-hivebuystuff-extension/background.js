const API_BASE = "https://hivebuystuff.hive.baby";
const POLL_INTERVAL_MS = 4000;

async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get("hbs_user_id", (data) => resolve(data.hbs_user_id ?? null));
  });
}

async function fetchPendingSessions(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/hbs/ext/session?user_id=${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function updateSessionStatus(userId, sessionId, status, result) {
  await fetch(`${API_BASE}/api/hbs/ext/session`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, user_id: userId, status, result }),
  });
}

async function executeSession(session) {
  const userId = await getUserId();
  if (!userId) return;

  await updateSessionStatus(userId, session.id, "executing", null);

  const STORE_URLS = {
    walmart: "https://www.walmart.com/search?q=",
    target: "https://www.target.com/s?searchTerm=",
    amazon: "https://www.amazon.com/s?k=",
    instacart: "https://www.instacart.com/store/search_v3/term?term=",
    kroger: "https://www.kroger.com/search?query=",
  };

  const baseUrl = STORE_URLS[session.backend];
  if (!baseUrl) {
    await updateSessionStatus(userId, session.id, "failed", { error: "Unknown backend" });
    return;
  }

  const results = { added: 0, failed: 0, items: [] };

  // Open each item in sequence, injecting a content script to attempt add-to-cart
  for (const item of session.items) {
    const searchUrl = baseUrl + encodeURIComponent(item.mapped ?? item.original);
    try {
      const tab = await chrome.tabs.create({ url: searchUrl, active: false });
      // Wait for page to load then attempt add-to-cart
      await new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            // Inject add-to-cart script
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: attemptAddToCart,
              args: [item.mapped ?? item.original, session.backend],
            }).then((res) => {
              const added = res?.[0]?.result?.added ?? false;
              results.items.push({ name: item.original, mapped: item.mapped, added });
              if (added) results.added++; else results.failed++;
              // Close tab after 2s so user can see it briefly
              setTimeout(() => chrome.tabs.remove(tab.id).catch(() => {}), 2000);
              resolve();
            }).catch(() => {
              results.items.push({ name: item.original, added: false });
              results.failed++;
              chrome.tabs.remove(tab.id).catch(() => {});
              resolve();
            });
          }
        });
      });
      // Brief pause between items to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      results.items.push({ name: item.original, added: false });
      results.failed++;
    }
  }

  const status = results.added > 0 ? "done" : "failed";
  await updateSessionStatus(userId, session.id, status, results);

  // Notify user
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "HiveBuyStuff",
    message: `${results.added} of ${session.items.length} items added to ${session.backend} cart.`,
  });
}

// Runs in the context of the retailer page — attempts to add first result to cart
function attemptAddToCart(productName, backend) {
  const selectors = {
    walmart: [
      '[data-automation-id="add-to-cart-button"]',
      'button[aria-label*="Add to cart"]',
      '.add-to-cart-btn',
    ],
    target: [
      '[data-test="addToCartButton"]',
      'button[aria-label*="add to cart" i]',
    ],
    amazon: [
      "#add-to-cart-button",
      "#submit.add-to-cart",
    ],
    instacart: [
      '[data-testid="add-item-button"]',
      'button[aria-label*="Add" i]',
    ],
    kroger: [
      '[data-testid="CartButton"]',
      'button[aria-label*="Add to cart" i]',
    ],
  };

  const targets = selectors[backend] ?? [];
  for (const sel of targets) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled) {
      btn.click();
      return { added: true, selector: sel };
    }
  }
  return { added: false };
}

// Poll for pending sessions every 4 seconds
async function poll() {
  const userId = await getUserId();
  if (!userId) return;

  const sessions = await fetchPendingSessions(userId);
  for (const session of sessions) {
    executeSession(session).catch(console.error);
  }
}

chrome.alarms.create("hbs-poll", { periodInMinutes: 1 / 15 }); // every 4s
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "hbs-poll") poll();
});

// Also poll immediately on install/startup
chrome.runtime.onInstalled.addListener(() => poll());
chrome.runtime.onStartup.addListener(() => poll());

// Message from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_USER_ID") {
    getUserId().then(sendResponse);
    return true;
  }
  if (msg.type === "SET_USER_ID") {
    chrome.storage.local.set({ hbs_user_id: msg.userId }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "POLL_NOW") {
    poll().then(() => sendResponse({ ok: true }));
    return true;
  }
});
