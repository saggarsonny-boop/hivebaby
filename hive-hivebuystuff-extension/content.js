// Content script — runs on retailer pages at document_idle.
// Listens for messages from the background service worker requesting cart actions.

const SELECTORS = {
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

function detectBackend() {
  const h = location.hostname;
  if (h.includes("walmart.com")) return "walmart";
  if (h.includes("target.com")) return "target";
  if (h.includes("amazon.com")) return "amazon";
  if (h.includes("instacart.com")) return "instacart";
  if (h.includes("kroger.com")) return "kroger";
  return null;
}

function tryAddToCart() {
  const backend = detectBackend();
  if (!backend) return { added: false, reason: "unknown_backend" };

  const targets = SELECTORS[backend] ?? [];
  for (const sel of targets) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled) {
      btn.click();
      return { added: true, selector: sel, backend };
    }
  }
  return { added: false, reason: "no_button_found", backend };
}

// Respond to one-shot messages from background.js
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "HBS_ADD_TO_CART") {
    const result = tryAddToCart();
    sendResponse(result);
  }
  return true;
});
