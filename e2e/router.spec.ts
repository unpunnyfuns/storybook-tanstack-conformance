import { expect, test } from "@playwright/test";
import { richAppTests } from "./shared/rich-app";

richAppTests({ homeHeading: "TanStack Router Repro Harness", hasAuthToggle: true });

test.describe("navigation triggers", () => {
  test("a link click navigates", async ({ page }) => {
    await page.goto("/nav-probe");
    await page.getByRole("link", { name: "by link" }).click();
    await expect(page.getByRole("heading", { name: "Nav target" })).toBeVisible();
  });

  test("useNavigate navigates", async ({ page }) => {
    await page.goto("/nav-probe");
    await page.getByRole("button", { name: "by hook" }).click();
    await expect(page.getByRole("heading", { name: "Nav target" })).toBeVisible();
  });

  test("a Navigate mounted after a click navigates", async ({ page }) => {
    await page.goto("/nav-probe");
    await page.getByRole("button", { name: "by component" }).click();
    await expect(page.getByRole("heading", { name: "Nav target" })).toBeVisible();
  });
});
