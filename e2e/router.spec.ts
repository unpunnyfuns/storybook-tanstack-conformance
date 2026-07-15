import { expect, test } from "@playwright/test";

test("home renders and client-side navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TanStack Router Repro Harness" })).toBeVisible();

  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About", level: 1 })).toBeVisible();
});

test("guarded route redirects when logged out", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText(/Redirected here from/u)).toBeVisible();
});
