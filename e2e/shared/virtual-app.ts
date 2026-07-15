import { expect, test } from "@playwright/test";

export interface VirtualAppOptions {
  homeHeading: string;
}

/**
 * Routing suite for the two virtual-routes apps: same virtual route config
 * (index, pathless layout with a child, param route), different home pages.
 */
export function virtualAppTests({ homeHeading }: VirtualAppOptions) {
  test("home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: homeHeading })).toBeVisible();
  });

  test("pathless layout child serves at its real URL with context", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(page.getByText(/Gate is open/u)).toBeVisible();
  });

  test("param route loads its data", async ({ page }) => {
    await page.goto("/items/3");
    await expect(page.getByRole("heading", { name: "Gizmo" })).toBeVisible();
  });

  test("client-side navigation between routes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Panel" }).click();
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
    await page.getByRole("link", { name: "Item 1" }).click();
    await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
  });

  test("unknown URL renders the 404 boundary", async ({ page }) => {
    await page.goto("/definitely-not-a-route");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });
}
