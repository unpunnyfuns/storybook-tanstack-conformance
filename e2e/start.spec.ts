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

test.describe("server-function semantics", () => {
  // Under SSR dev mode the page is visible before React hydrates; retry the
  // click until it lands after hydration attaches the handler.
  test("middleware server phase seeds handler context", async ({ page }) => {
    await page.goto("/server-probes");
    await expect(async () => {
      await page.getByRole("button", { name: "who am i" }).click();
      await expect(page.getByText("user: ada")).toBeVisible({ timeout: 1000 });
    }).toPass();
  });

  test("validator transforms input before the handler", async ({ page }) => {
    await page.goto("/server-probes");
    await expect(async () => {
      await page.getByRole("button", { name: "increment" }).click();
      await expect(page.getByText("sum: 2")).toBeVisible({ timeout: 1000 });
    }).toPass();
  });

  test("setCookie does not feed getCookie within one request", async ({ page }) => {
    await page.goto("/server-probes");
    await expect(async () => {
      await page.getByRole("button", { name: "cookie echo" }).click();
      await expect(page.getByText("cookie: unset")).toBeVisible({ timeout: 1000 });
    }).toPass();
  });

  test("middleware client phase runs in the browser", async ({ page }) => {
    await page.goto("/server-probes");
    await expect(async () => {
      await page.getByRole("button", { name: "tracked" }).click();
      await expect(page.getByText("traced: tracked ok with client phase")).toBeVisible({
        timeout: 1000,
      });
    }).toPass();
  });

  test("a server fn that throws redirect() navigates the page", async ({ page }) => {
    await page.goto("/redirector");
    await expect(page.getByText("done: no")).toBeVisible();
    await expect(async () => {
      await page.getByRole("button", { name: "log in" }).click();
      await expect(page.getByText("done: yes")).toBeVisible({ timeout: 1000 });
    }).toPass();
  });
});
