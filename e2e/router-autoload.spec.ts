import { expect, test } from "@playwright/test";

/**
 * The real-app control for the route-tree autoload gauge. This app's Storybook
 * preview does not import `routeTree.gen`; its entry module does, so the same
 * route renders here with the parent chain and layout context the story asks
 * for. The strings below are the ones the story asserts.
 */

test("the frame's index serves at the site root, inside the layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Autoload Home" })).toBeVisible();
  await expect(page.getByText(/Frame layout/u)).toBeVisible();
  await expect(page.getByText(/Inside of:/u)).toContainText("Autoload Frame");
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
