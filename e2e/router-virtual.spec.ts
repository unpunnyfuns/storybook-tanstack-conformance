import { expect, test } from "@playwright/test";

test("home renders and virtual routes navigate", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Virtual routes" })).toBeVisible();

  await page.getByRole("link", { name: "Panel" }).click();
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
  await expect(page.getByText(/Gate is open/u)).toBeVisible();

  await page.getByRole("link", { name: "Item 1" }).click();
  await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
});
