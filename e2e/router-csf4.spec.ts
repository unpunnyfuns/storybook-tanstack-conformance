import { expect, test } from "@playwright/test";

/**
 * The app behind the CSF factories story suite. Nothing here is CSF-specific:
 * the point is that the app itself works, so a red story suite in
 * apps/router-csf4 points at the framework's CSF4 code path rather than at
 * broken routes.
 */

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "CSF Factories Harness" })).toBeVisible();
});

test("flat route renders", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
});

test("pathless layout child serves at its real URL with context", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(/Signed in as:/u)).toContainText("Ada Lovelace");
});

test("param route loads its data", async ({ page }) => {
  await page.goto("/users/2");
  await expect(page.getByRole("heading", { name: "Grace Hopper" })).toBeVisible();
});

test("client-side navigation between routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await page.getByRole("link", { name: "Ada" }).click();
  await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
