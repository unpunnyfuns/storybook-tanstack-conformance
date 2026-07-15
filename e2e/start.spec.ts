import { expect, test } from "@playwright/test";
import { richAppTests } from "./shared/rich-app";

// The start app mirrors the router app's route tree, so it runs the same
// rich suite, plus its Start-specific routes.
richAppTests({ homeHeading: "Inventory", hasAuthToggle: false });

test("server-function loader renders through SSR", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Widget: 12 in stock/u)).toBeVisible();
});

test("param route with a validated server function", async ({ page }) => {
  await page.goto("/items/3");
  await expect(page.getByRole("heading", { name: "Gizmo" })).toBeVisible();
});

test("pathless layout route serves at its real URL", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
});
