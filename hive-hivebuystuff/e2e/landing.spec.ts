import { test, expect } from "@playwright/test";

test("landing page loads with canonical branding", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/HiveBuyStuff/);
  // Hive logo present
  await expect(page.locator('img[alt="Hive ecosystem"]')).toBeVisible();
  // Engine wordmark
  await expect(page.getByText("HiveBuyStuff", { exact: false })).toBeVisible();
  // Backend showcase visible
  await expect(page.getByText("Walmart")).toBeVisible();
  await expect(page.getByText("Target")).toBeVisible();
  await expect(page.getByText("Amazon")).toBeVisible();
  await expect(page.getByText("Instacart")).toBeVisible();
  await expect(page.getByText("Kroger")).toBeVisible();
  // Tabs visible
  await expect(page.getByRole("tab", { name: "My Lists" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Run a Cart" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
  // Canonical footer
  await expect(page.getByText(/Made with/)).toBeVisible();
  await expect(page.getByText(/No ads/)).toBeVisible();
});

test("manifest.json has canonical theme_color", async ({ request }) => {
  const res = await request.get("/manifest.json");
  expect(res.status()).toBe(200);
  const manifest = await res.json();
  expect(manifest.theme_color).toBe("#D4AF37");
  expect(manifest.name).toBe("HiveBuyStuff");
  expect(manifest.display).toBe("standalone");
});

test("first visit card appears then dismisses", async ({ page }) => {
  // Clear localStorage to simulate first visit
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("hbs_welcomed_hivebuystuff"));
  await page.reload();
  const card = page.getByText("Build once. Buy anywhere.", { exact: false }).first();
  await expect(card).toBeVisible({ timeout: 5000 });
  // Dismiss
  await page.getByText("Got it").click();
  await expect(card).not.toBeVisible({ timeout: 3000 });
  // Reload — card should not reappear
  await page.reload();
  await page.waitForTimeout(1000);
  await expect(page.getByText("Create my first list →")).not.toBeVisible();
});
