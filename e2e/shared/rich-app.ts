import { expect, test } from "@playwright/test";

export interface RichAppOptions {
  homeHeading: string;
  hasAuthToggle: boolean;
}

/**
 * The full routing suite for the two file-based apps. Their route trees are
 * mirrored, so the same assertions hold for both; only the home page and the
 * auth toggle differ.
 */
export function richAppTests({ homeHeading, hasAuthToggle }: RichAppOptions) {
  test("home renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: homeHeading })).toBeVisible();
  });

  test("flat route", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "About", level: 1 })).toBeVisible();
  });

  test("pathful layout, param route, and loader data", async ({ page }) => {
    await page.goto("/users");
    await page.getByRole("link", { name: "Ada Lovelace" }).click();
    await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
    await expect(page.getByText("ada@example.com", { exact: false })).toBeVisible();
  });

  test("notFound() from a loader renders the 404 boundary", async ({ page }) => {
    await page.goto("/users/999");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("unknown URL renders the 404 boundary", async ({ page }) => {
    await page.goto("/definitely-not-a-route");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("search params filter and paginate", async ({ page }) => {
    await page.goto("/posts?tag=all&page=1&sort=newest");
    await expect(page.getByText(/Total matching: 23/u)).toBeVisible();

    // Under SSR dev mode the page is visible before React hydrates; retry
    // the interaction until the URL proves a handler ran.
    await expect(async () => {
      await page.getByLabel("Tag:").selectOption("news");
      await expect(page).toHaveURL(/tag=news/u, { timeout: 1000 });
    }).toPass();
    await expect(page.getByText(/Total matching: 8/u)).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText(/Page 2 \//u)).toBeVisible();
    await expect(page).toHaveURL(/page=2/u);
  });

  test("nested layout under a param", async ({ page }) => {
    await page.goto("/posts/3?highlight=false");
    await expect(page.getByRole("heading", { name: "Post 3" })).toBeVisible();
    await expect(page.getByText(/Nested layout under/u)).toBeVisible();
  });

  test("auth guard redirects when logged out", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/redirectedFrom=/u);
  });

  if (hasAuthToggle) {
    test("logging in unlocks the guarded route", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Log in" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
      await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
      await expect(page.getByText(/Authenticated \(from route context\): true/u)).toBeVisible();
    });
  }

  test("group directory route serves at its group-free URL", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  });

  test("nested pathless layout serves at its real URL", async ({ page }) => {
    await page.goto("/posts/archived");
    await expect(page.getByRole("heading", { name: "Archived posts" })).toBeVisible();
    await expect(page.getByText(/Total archived: 5/u)).toBeVisible();
  });

  test("optional path param matches with and without the param", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText("Category: all")).toBeVisible();
    await page.goto("/blog/guides");
    await expect(page.getByText("Category: guides")).toBeVisible();
  });

  test("prefixed path param", async ({ page }) => {
    await page.goto("/orders/order-42");
    await expect(page.getByRole("heading", { name: "Order 42" })).toBeVisible();
  });

  test("splat route captures the rest of the URL", async ({ page }) => {
    await page.goto("/files/reports/2026/q2.pdf");
    await expect(page.getByText("reports/2026/q2.pdf")).toBeVisible();
  });

  test("lazy route loads its component and eager loader data", async ({ page }) => {
    await page.goto("/lazy-page");
    await expect(page.getByRole("heading", { name: "Lazy page" })).toBeVisible();
    await expect(page.getByText(/Loader said: eager loader/u)).toBeVisible();
  });

  test("loaderDeps re-runs the loader from search params", async ({ page }) => {
    await page.goto("/search?q=post 2");
    await expect(page.getByText("Results: 5")).toBeVisible();
  });

  test("route-level error boundary catches a throwing loader", async ({ page }) => {
    await page.goto("/boom");
    await expect(page.getByRole("heading", { name: "Boom boundary" })).toBeVisible();
  });

  test("pathless layout index child with beforeLoad context", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
    await expect(page.getByText(/Tab of:/u)).toBeVisible();
  });

  test("query-backed route renders through the loader cache", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.getByText(/Ada: Solid routing/u)).toBeVisible();
  });
}
