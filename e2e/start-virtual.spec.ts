import { expect, test } from "@playwright/test";
import { virtualAppTests } from "./shared/virtual-app";

virtualAppTests({ homeHeading: "Inventory" });

test("server-function loader renders through SSR", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Widget: 12 in stock/u)).toBeVisible();
});
