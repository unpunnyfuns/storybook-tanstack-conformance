import { expect, test } from "@playwright/test";

// Code-based Start runs in dev (SSR, server functions, document shell); only
// the production build is off the table, since Start's manifest requires
// generated routes.

test("server-function loader renders through SSR", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByText(/Widget: 12 in stock/u)).toBeVisible();
});

test("param route with a validated server function", async ({ page }) => {
  await page.goto("/items/3");
  await expect(page.getByRole("heading", { name: "Gizmo" })).toBeVisible();
  await expect(page.getByText("Stock: 4")).toBeVisible();
});

test("client-side navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Item 1" }).click();
  await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
