import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const BASE = process.env.BASE_URL ?? "https://hivebuystuff.hive.baby";
const USER_ID = `e2e-${randomUUID()}`;

test.describe("Template CRUD", () => {
  test("create a list via API and it appears in UI", async ({ page, request }) => {
    // Create template via API
    const res = await request.post(`${BASE}/api/hbs/templates`, {
      data: {
        user_id: USER_ID,
        name: "E2E Groceries",
        items: [
          { name: "whole milk", quantity: 1, unit: "gallon", brand_tier: "budget", perishable: true, substitution_allowed: true },
          { name: "bananas", quantity: 6, unit: null, brand_tier: "budget", perishable: true, substitution_allowed: true },
        ],
      },
    });
    expect(res.status()).toBe(201);
    const tmpl = await res.json();
    expect(tmpl.name).toBe("E2E Groceries");
    const templateId = tmpl.id;

    // Seed user_id into page localStorage then load
    await page.goto("/");
    await page.evaluate((uid) => localStorage.setItem("hbs_user_id", uid), USER_ID);
    await page.reload();

    // Template card should appear
    await expect(page.getByText("E2E Groceries")).toBeVisible({ timeout: 8000 });

    // Clean up
    await request.delete(`${BASE}/api/hbs/templates/${templateId}`, {
      data: { user_id: USER_ID },
    });
  });

  test("delete template enforces ownership — wrong user_id returns 404", async ({ request }) => {
    const createRes = await request.post(`${BASE}/api/hbs/templates`, {
      data: {
        user_id: USER_ID,
        name: "E2E Delete Guard",
        items: [{ name: "eggs", quantity: 12, unit: null, brand_tier: "mid", perishable: true, substitution_allowed: false }],
      },
    });
    const tmpl = await createRes.json();

    const delRes = await request.delete(`${BASE}/api/hbs/templates/${tmpl.id}`, {
      data: { user_id: "wrong-user-id" },
    });
    expect(delRes.status()).toBe(404);

    // Clean up with correct user
    await request.delete(`${BASE}/api/hbs/templates/${tmpl.id}`, {
      data: { user_id: USER_ID },
    });
  });

  test("free tier: 4th list creation returns 429 upgrade_required", async ({ request }) => {
    const listNames = ["FT List 1", "FT List 2", "FT List 3"];
    const ids: string[] = [];
    const ftUser = `e2e-ft-${randomUUID()}`;

    // Create 3 lists (free tier max)
    for (const name of listNames) {
      const res = await request.post(`${BASE}/api/hbs/templates`, {
        data: { user_id: ftUser, name, items: [{ name: "milk", quantity: 1, unit: null, brand_tier: "budget", perishable: true, substitution_allowed: true }] },
      });
      expect(res.status()).toBe(201);
      ids.push((await res.json()).id);
    }

    // 4th list should be blocked
    const blocked = await request.post(`${BASE}/api/hbs/templates`, {
      data: { user_id: ftUser, name: "FT List 4", items: [{ name: "bread", quantity: 1, unit: null, brand_tier: "budget", perishable: false, substitution_allowed: true }] },
    });
    expect(blocked.status()).toBe(429);
    const err = await blocked.json();
    expect(err.upgrade_required).toBe(true);

    // Clean up
    for (const id of ids) {
      await request.delete(`${BASE}/api/hbs/templates/${id}`, { data: { user_id: ftUser } });
    }
  });
});
