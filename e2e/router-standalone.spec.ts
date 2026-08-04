import { expect, test } from "@playwright/test";

/**
 * The real-app control for the standalone-route gauges. Storybook never
 * connects this app's generated tree (`generatedRouteTree: false`), but the app
 * entry module runs it as every app does, so these routes behave here exactly
 * as TanStack intends. The strings below are the ones the stories assert.
 *
 * The pairs matter more than the individual cases. A real app serves a nested
 * index at both its ancestor URL and that URL with a trailing slash, so any
 * gauge that passes at one and fails at the other has found a difference the
 * framework introduced.
 *
 * The layout cases are the one exception to "the gauge asserts what the twin
 * proves". These tests show the `_tabs` layout wrapping its index here, and the
 * matching gauges assert it is absent, because turning off the route tree
 * connection means the layout module is never imported. The twin is what makes
 * that cost visible: without it, an orphaned index looks like correct output.
 */

test("the layout index serves at its ancestor URL", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
  await expect(page.getByText(/Tabs layout/u)).toBeVisible();
  await expect(page.getByText(/Tab of:/u)).toContainText("Settings");
});

test("the layout index serves at the same URL with a trailing slash", async ({ page }) => {
  await page.goto("/settings/");
  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
  await expect(page.getByText(/Tabs layout/u)).toBeVisible();
  await expect(page.getByText(/Tab of:/u)).toContainText("Settings");
});

test("a plain nested index serves at its ancestor URL", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByRole("heading", { name: "Docs Index" })).toBeVisible();
  await expect(page.getByText(/no pathless layout involved/u)).toBeVisible();
});

test("a plain nested index serves at the same URL with a trailing slash", async ({ page }) => {
  await page.goto("/docs/");
  await expect(page.getByRole("heading", { name: "Docs Index" })).toBeVisible();
  await expect(page.getByText(/no pathless layout involved/u)).toBeVisible();
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
