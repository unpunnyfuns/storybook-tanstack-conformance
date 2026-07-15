import { expect, test } from "@playwright/test";

test("virtual routes serve with server functions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByText(/Widget: 12 in stock/u)).toBeVisible();

  await page.getByRole("link", { name: "Panel" }).click();
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  await expect(page.getByText(/Gate is open/u)).toBeVisible();
});
