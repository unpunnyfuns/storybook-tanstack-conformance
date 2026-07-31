import { expect, test } from "@playwright/test";

/**
 * App-shell routing: every page the user sees lives under a root-level pathless
 * `_app` layout, so the shell's index owns `/` and there is no sibling index
 * route. `/login` sits outside the shell.
 */

test("the shell's index serves at the site root, inside the layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Shell Home" })).toBeVisible();
  await expect(page.getByText(/Shell layout/u)).toBeVisible();
  await expect(page.getByText(/Inside of:/u)).toContainText("App Shell");
});

test("a pathful sibling serves at its own URL, inside the same layout", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText(/Inside of:/u)).toContainText("App Shell");
});

test("a route outside the shell renders without shell chrome", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByText(/Shell layout/u)).toBeHidden();
});

test("client-side navigation in and out of the shell", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await page.getByRole("link", { name: "Back to the app" }).click();
  await expect(page.getByRole("heading", { name: "Shell Home" })).toBeVisible();
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
