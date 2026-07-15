import { expect, test } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Code-based routing" })).toBeVisible();
});

test("search params drive the loader through loaderDeps", async ({ page }) => {
  await page.goto("/widgets?sort=asc");
  await expect(page.getByRole("heading", { name: "Widgets" })).toBeVisible();
  const asc = await page.getByRole("listitem").allTextContents();
  expect(asc.join(",")).toBe("Gadget,Gizmo,Widget");

  await page.goto("/widgets?sort=desc");
  const desc = await page.getByRole("listitem").allTextContents();
  expect(desc.join(",")).toBe("Widget,Gizmo,Gadget");
});

test("param route with search and id-only layout context", async ({ page }) => {
  await page.goto("/widgets/3?zoom=true");
  await expect(page.getByRole("heading", { name: "Gizmo" })).toBeVisible();
  await expect(page.getByText("zoom: true")).toBeVisible();
  await expect(page.getByText("shell: ready")).toBeVisible();
  await expect(page.getByText("shell layout")).toBeVisible();
});

test("client-side navigation through the code-based tree", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Widgets" }).click();
  await expect(page.getByRole("heading", { name: "Widgets" })).toBeVisible();
  await page.getByRole("link", { name: "Widget 1" }).click();
  await expect(page.getByRole("heading", { name: "Widget" })).toBeVisible();
});

test("loader error renders the error boundary", async ({ page }) => {
  await page.goto("/widgets/999");
  await expect(page.getByText(/No widget with id 999/u)).toBeVisible();
});

test("unknown URL renders the 404 boundary", async ({ page }) => {
  await page.goto("/definitely-not-a-route");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
