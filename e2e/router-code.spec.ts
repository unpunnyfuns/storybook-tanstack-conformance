import { expect, test } from "@playwright/test";

test("home renders and the code-based tree navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Code-based routing" })).toBeVisible();

  await page.getByRole("link", { name: "Widgets" }).click();
  await expect(page.getByRole("heading", { name: "Widgets" })).toBeVisible();
  await expect(page.getByText("sort: asc")).toBeVisible();

  await page.getByRole("link", { name: "Widget 1" }).click();
  await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
  await expect(page.getByText("shell: ready")).toBeVisible();
});
