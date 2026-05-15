import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const BASE = process.env.BASE_URL ?? "https://hivebuystuff.hive.baby";
const USER_ID = `e2e-cart-${randomUUID()}`;

test.describe("Cart routing", () => {
  let templateId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${BASE}/api/hbs/templates`, {
      data: {
        user_id: USER_ID,
        name: "E2E Cart Test",
        items: [
          { name: "whole milk 1 gallon", quantity: 1, unit: null, brand_tier: "budget", perishable: true, substitution_allowed: true },
          { name: "sliced bread", quantity: 1, unit: null, brand_tier: "budget", perishable: false, substitution_allowed: true },
        ],
      },
    });
    expect(res.status()).toBe(201);
    templateId = (await res.json()).id;
  });

  test.afterAll(async ({ request }) => {
    if (templateId) {
      await request.delete(`${BASE}/api/hbs/templates/${templateId}`, {
        data: { user_id: USER_ID },
      });
    }
  });

  for (const backend of ["walmart", "target", "amazon", "instacart"]) {
    test(`AI routes to ${backend} and returns valid cart`, async ({ request }) => {
      const res = await request.post(`${BASE}/api/hbs/route`, {
        data: { template_id: templateId, backend, user_id: USER_ID },
      });
      expect(res.status()).toBe(200);
      const cart = await res.json();
      expect(cart.backend).toBe(backend);
      expect(Array.isArray(cart.items)).toBe(true);
      expect(cart.items.length).toBeGreaterThan(0);
      expect(typeof cart.cart_url).toBe("string");
      expect(cart.cart_url).toContain("http");
      // Each item has original, mapped, qty
      for (const item of cart.items) {
        expect(item.original).toBeTruthy();
        expect(item.mapped).toBeTruthy();
        expect(typeof item.qty).toBe("number");
      }
    });
  }

  test("usage increments after each run", async ({ request }) => {
    const before = await request.get(`${BASE}/api/hbs/usage?user_id=${USER_ID}`);
    const beforeCount = (await before.json()).run_count;

    await request.post(`${BASE}/api/hbs/route`, {
      data: { template_id: templateId, backend: "walmart", user_id: USER_ID },
    });

    const after = await request.get(`${BASE}/api/hbs/usage?user_id=${USER_ID}`);
    const afterCount = (await after.json()).run_count;
    expect(afterCount).toBeGreaterThan(beforeCount);
  });
});
