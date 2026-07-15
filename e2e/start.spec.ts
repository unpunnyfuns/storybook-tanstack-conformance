import { expect, test } from "@playwright/test";

test("server-function loader renders and navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByText(/Widget: 12 in stock/u)).toBeVisible();

  await page.getByRole("link", { name: "Item 1" }).click();
  await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
});

test("pathless layout route serves at its real URL", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
});
