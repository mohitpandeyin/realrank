import { expect, test } from "@playwright/test";

test("home foundation renders without horizontal overflow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The Real Estate Discovery Index",
  );
  await expect(page.getByRole("link", { name: "Realrank home" })).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("health endpoint exposes no operational detail", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("canonical redirects use permanent redirect status", async ({ request }) => {
  const response = await request.get("/faq", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/help");
});

test("admin parent routes exist without exposing records", async ({ page }) => {
  await page.goto("/admin/entities");
  await expect(page.getByRole("heading", { level: 1, name: "Entities" })).toBeVisible();
  await expect(page.getByText("Protected entities list route")).toBeVisible();
});

test("owner shell remains scannable without horizontal overflow", async ({ page }) => {
  await page.goto("/manage");

  const ownerNavigation = page.getByRole("navigation", { name: "Owner navigation" });
  await expect(ownerNavigation.getByText("Home", { exact: true })).toBeVisible();
  await expect(ownerNavigation.getByText("Insights", { exact: true })).toBeVisible();
  await expect(ownerNavigation.getByText("Account", { exact: true })).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("transaction shell keeps help accessible", async ({ page }) => {
  await page.goto("/access");
  await expect(page.getByRole("link", { name: "Get help" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Manage your Realrank profile" }),
  ).toBeVisible();
});
