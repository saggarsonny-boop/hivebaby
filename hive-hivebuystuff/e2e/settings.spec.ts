import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const BASE = process.env.BASE_URL ?? "https://hivebuystuff.hive.baby";
const USER_ID = `e2e-settings-${randomUUID()}`;

test.describe("Settings", () => {
  test("save and reload preferences round-trips correctly", async ({ request }) => {
    const saveRes = await request.post(`${BASE}/api/hbs/preferences`, {
      data: {
        user_id: USER_ID,
        substitution_tolerance: "strict",
        dietary_rules: ["gluten-free", "no pork"],
        budget_ceiling: 75,
        preferred_backends: ["Walmart", "Target"],
      },
    });
    expect(saveRes.status()).toBe(200);

    const getRes = await request.get(`${BASE}/api/hbs/preferences?user_id=${USER_ID}`);
    expect(getRes.status()).toBe(200);
    const prefs = await getRes.json();
    expect(prefs.substitution_tolerance).toBe("strict");
    expect(prefs.dietary_rules).toContain("gluten-free");
    expect(prefs.dietary_rules).toContain("no pork");
    expect(Number(prefs.budget_ceiling)).toBe(75);
    expect(prefs.preferred_backends).toContain("Walmart");
    expect(prefs.preferred_backends).toContain("Target");
  });

  test("settings UI loads and shows tolerance options", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((uid) => localStorage.setItem("hbs_user_id", uid), USER_ID);
    await page.reload();

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByText("How flexible are you with swaps?")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("strict", { exact: false })).toBeVisible();
    await expect(page.getByText("flexible", { exact: false })).toBeVisible();
    await expect(page.getByText("auto", { exact: false })).toBeVisible();
    // Preferred stores listed
    await expect(page.getByText("Walmart")).toBeVisible();
    await expect(page.getByText("Kroger")).toBeVisible();
  });
});
