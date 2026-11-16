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

test("discovery filters stay stable and expose their selected state", async ({ page }) => {
  await page.goto("/");

  const filters = page.locator('[aria-label="Filter the Realrank Index by category"]');
  await expect(filters.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
  await expect(filters.getByRole("link")).toHaveText([
    "All",
    "Residential",
    "Commercial",
    "Land & Plot",
  ]);

  await filters.getByRole("link", { name: "Commercial" }).click();
  await expect(page).toHaveURL(/category=commercial/);
  await expect(
    page
      .locator('[aria-label="Filter the Realrank Index by category"]')
      .getByRole("link", { name: "Commercial" }),
  ).toHaveAttribute("aria-current", "page");
});

test("floating listing action appears only after the hero", async ({ page }) => {
  await page.goto("/");

  const floatingAction = page.getByTestId("floating-list-entity");
  await expect(floatingAction).toHaveAttribute("aria-hidden", "true");

  await page.locator("#realrank-index").scrollIntoViewIfNeeded();
  await expect(floatingAction).toHaveAttribute("aria-hidden", "false");
});

test("listing amount accepts free entry and buttons step to adjacent tens", async ({ page }) => {
  await page.goto("/?amount=151#rr-entry-form");

  const amount = page.getByLabel("Rank Amount, minimum 10 rupees");
  await expect(amount).toHaveValue("151");

  await page.getByRole("button", { name: "Move to the next 10-rupee amount" }).click();
  await expect(amount).toHaveValue("160");

  await page.getByRole("button", { name: "Move to the previous 10-rupee amount" }).click();
  await expect(amount).toHaveValue("150");
});

test("listing entry reports server validation without reaching checkout", async ({ page }) => {
  await page.goto("/#rr-entry-form");

  await page.getByLabel("Entity name").fill("A");
  await page.getByLabel("Contact or WhatsApp number").fill("123");
  await page.getByLabel("Rank Amount, minimum 10 rupees").fill("9");
  await page.getByRole("button", { name: "List your Entity" }).click();

  await expect(page.getByText("Enter an entity name with at least 2 characters.")).toBeVisible();
  await expect(page.getByText("Enter a valid 10-digit Indian mobile number.")).toBeVisible();
  await expect(page.getByText("Rank Amount must be at least ₹10.")).toBeVisible();
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
