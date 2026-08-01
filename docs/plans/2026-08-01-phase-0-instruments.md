# Phase 0: Instruments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add gauge stories and matching Playwright tests that measure the audit findings the suite does not cover yet: server-function semantics (middleware, validator, cookies), `createStart`, `useServerFn` redirects, and the three ways an app navigates.

**Architecture:** No new apps and no port changes. Gauges are new routes, modules, and stories inside the existing `apps/start` and `apps/router` workspaces. Every gauge asserts what the real app does, proven by a Playwright test with the same assertion against the real dev server. A gauge that fails in Storybook is the instrument working, so this phase ends by re-measuring all three channels and recording the new failures in `expectations.json`.

**Tech Stack:** Existing suite tooling: Vitest browser mode + `@storybook/addon-vitest` for stories, Playwright for the real app, `scripts/channel.mjs` / `scripts/conformance-report.mjs` / `scripts/verify.mjs` for measurement.

## Global Constraints

- Repo: `/Users/palnes/src/conformance` (public, branch `main`). Working tree must be clean before starting.
- CSF3 only in `apps/start` and `apps/router` (`scripts/assert-csf-modes.mjs` enforces this; only `-csf4` suffixed apps use factories).
- Every new story carries `tags: ["ai-generated"]`.
- Style: double quotes, semicolons (`oxfmt`); no end-of-line comments; no em dashes in any committed text.
- Story files never become routes: the router plugin runs with `routeFileIgnorePattern: ".stories."`.
- Gauge stories assert real-app behavior, so they are EXPECTED TO FAIL in Storybook on every channel, including `patched`. The `patched` badge dropping below 94/94 is the intended outcome of this phase, not a regression.
- `expectations.json` is never edited by hand; it changes only through `node scripts/verify.mjs <channel> --update` (Task 5).
- Do not modify any existing story, route, or e2e test.
- Commit per task locally; push only after Task 5, so CI's `verify` run sees the updated expectations in the same push.
- On a fresh clone run `npm test` once before `npm run check` (typecheck needs the generated `routeTree.gen.ts` files).

## File Structure

```
apps/start/src/server-probe-fns.ts             server fns exercising middleware/validator/cookies
apps/start/src/routes/server-probes.tsx        page that runs them and prints results
apps/start/src/routes/server-probes.stories.tsx
apps/start/src/routes/redirector.tsx           useServerFn + thrown redirect
apps/start/src/routes/redirector.stories.tsx
apps/start/src/start-instance.stories.tsx      createStart shape gauge (no route; crash containment)
apps/router/src/routes/nav-target.tsx          navigation destination
apps/router/src/routes/nav-probe.tsx           Link / useNavigate / <Navigate> triggers
apps/router/src/navigation.stories.tsx         tree-mode navigation gauges
e2e/start.spec.ts                              (append) real-app proof for the start gauges
e2e/router.spec.ts                             (append) real-app proof for the navigation gauges
expectations.json                              (via verify --update only)
README.md                                      (regenerated sections only, via scripts/docs.mjs)
```

---

### Task 1: Server-function semantics gauges (start app)

Measures audit findings 4 (middleware and validator discarded), 21/22 (cookie and header semantics).

**Files:**
- Create: `apps/start/src/server-probe-fns.ts`
- Create: `apps/start/src/routes/server-probes.tsx`
- Create: `apps/start/src/routes/server-probes.stories.tsx`
- Modify: `e2e/start.spec.ts` (append)

**Interfaces:**
- Produces: `whoAmI(): Promise<string>`, `increment(opts: { data: unknown }): Promise<number>`, `cookieEcho(): Promise<string>`, `tracked(): Promise<string>`, `clientPhaseLog: string[]`; route `/server-probes` rendering `user: ...`, `sum: ...`, `cookie: ...`, `traced: ...` lines after button clicks. Task 5 consumes the changed story totals.

- [ ] **Step 1: Write the server functions**

`apps/start/src/server-probe-fns.ts`:

```ts
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

/**
 * Server-function semantics probes. Each fn isolates one behavior the real
 * runtime guarantees; the /server-probes page runs them and prints results so
 * the same assertions hold in a story and in a Playwright test.
 */

export const clientPhaseLog: string[] = [];

const loggingMiddleware = createMiddleware({ type: "function" }).client(({ next }) => {
  clientPhaseLog.push("client phase ran");
  return next();
});

const userMiddleware = createMiddleware({ type: "function" }).server(({ next }) =>
  next({ context: { user: "ada" } }),
);

/** Middleware server phase seeds context; the handler reads it. */
export const whoAmI = createServerFn({ method: "GET" })
  .middleware([userMiddleware])
  .handler(({ context }) => (context as { user?: string }).user ?? "nobody");

/** Middleware client phase runs in the browser before the call goes out. */
export const tracked = createServerFn({ method: "GET" })
  .middleware([loggingMiddleware])
  .handler(() => "tracked ok");

/** The validator transforms input before the handler sees it. */
export const increment = createServerFn({ method: "POST" })
  .validator((raw: unknown) => Number(raw))
  .handler(({ data }) => (data as number) + 1);

/** setCookie writes the response; getCookie reads the request. They do not meet. */
export const cookieEcho = createServerFn({ method: "POST" }).handler(() => {
  setCookie("probe", "abc");
  return getCookie("probe") ?? "unset";
});
```

- [ ] **Step 2: Write the probe page**

`apps/start/src/routes/server-probes.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { clientPhaseLog, cookieEcho, increment, tracked, whoAmI } from "../server-probe-fns";

export const Route = createFileRoute("/server-probes")({
  component: ServerProbesPage,
});

function ServerProbesPage() {
  const [results, setResults] = useState<Record<string, string>>({});
  const record = (key: string, run: () => Promise<unknown>) => async () => {
    const value = await run().catch((error: unknown) => `error: ${String(error)}`);
    setResults((prev) => ({ ...prev, [key]: String(value) }));
  };
  return (
    <main>
      <h1>Server probes</h1>
      <button type="button" onClick={record("user", () => whoAmI())}>
        who am i
      </button>
      <button type="button" onClick={record("sum", () => increment({ data: "1" }))}>
        increment
      </button>
      <button type="button" onClick={record("cookie", () => cookieEcho())}>
        cookie echo
      </button>
      <button
        type="button"
        onClick={record("traced", async () => `${await tracked()} after ${clientPhaseLog.length} client phases`)}
      >
        tracked
      </button>
      <p>user: {results.user ?? "pending"}</p>
      <p>sum: {results.sum ?? "pending"}</p>
      <p>cookie: {results.cookie ?? "pending"}</p>
      <p>traced: {results.traced ?? "pending"}</p>
    </main>
  );
}
```

- [ ] **Step 3: Write the gauge stories**

`apps/start/src/routes/server-probes.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { Route } from "./server-probes";

/**
 * Gauges for server-function semantics. Each story asserts what the REAL app
 * does (proven by the matching tests in e2e/start.spec.ts). Failures here are
 * measurements of mock drift, not test bugs.
 */
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/server-probes" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Middleware server phase seeds context.user; the handler must see it. */
export const MiddlewareServerContext: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "who am i" }));
    await expect(await canvas.findByText("user: ada")).toBeVisible();
  },
};

/** The validator coerces "1" to 1 before the handler adds 1. */
export const ValidatorTransforms: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "increment" }));
    await expect(await canvas.findByText("sum: 2")).toBeVisible();
  },
};

/** setCookie writes the response; getCookie reads the request. No round trip. */
export const CookieScope: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "cookie echo" }));
    await expect(await canvas.findByText("cookie: unset")).toBeVisible();
  },
};

/** Middleware client phase runs in the browser exactly once per call. */
export const MiddlewareClientPhase: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "tracked" }));
    await expect(await canvas.findByText("traced: tracked ok after 1 client phases")).toBeVisible();
  },
};
```

- [ ] **Step 4: Append the real-app proof**

Append to `e2e/start.spec.ts`:

```ts
test.describe("server-function semantics", () => {
  test("middleware server phase seeds handler context", async ({ page }) => {
    await page.goto("/server-probes");
    await page.getByRole("button", { name: "who am i" }).click();
    await expect(page.getByText("user: ada")).toBeVisible();
  });

  test("validator transforms input before the handler", async ({ page }) => {
    await page.goto("/server-probes");
    await page.getByRole("button", { name: "increment" }).click();
    await expect(page.getByText("sum: 2")).toBeVisible();
  });

  test("setCookie does not feed getCookie within one request", async ({ page }) => {
    await page.goto("/server-probes");
    await page.getByRole("button", { name: "cookie echo" }).click();
    await expect(page.getByText("cookie: unset")).toBeVisible();
  });

  test("middleware client phase runs in the browser", async ({ page }) => {
    await page.goto("/server-probes");
    await page.getByRole("button", { name: "tracked" }).click();
    await expect(page.getByText("traced: tracked ok after 1 client phases")).toBeVisible();
  });
});
```

- [ ] **Step 5: Run the story suite; the four new stories must fail, existing ones must not change**

Run: `npm run test --workspace=apps/start`
Expected failures and reasons (capture the output):
- `MiddlewareServerContext`: mock discards middleware, handler context is undefined, page shows `user: error: ...` or `user: nobody`.
- `ValidatorTransforms`: mock discards the validator, `"1" + 1` prints `sum: 11`.
- `CookieScope`: mock stores cookies in one map, prints `cookie: abc`.
- `MiddlewareClientPhase`: client phase never runs, prints `after 0 client phases`.
If a story fails for a DIFFERENT reason (crash at import, wrong text entirely), stop and investigate before continuing: the gauge must measure the drift it names.

- [ ] **Step 6: Run the real-app proof; all four must pass**

Run: `npx playwright test e2e/start.spec.ts`
Expected: all tests pass, including the four new ones. If a new e2e test fails, the gauge's assertion about real behavior is wrong: fix the assertion (in both the e2e test and the story) until the e2e passes, then re-run Step 5.

- [ ] **Step 7: Check and commit**

Run: `npm run check`
Expected: clean (typecheck, oxfmt, oxlint, csf modes, docs check).

```bash
git add apps/start/src/server-probe-fns.ts apps/start/src/routes/server-probes.tsx apps/start/src/routes/server-probes.stories.tsx e2e/start.spec.ts
git commit -m "test: gauge server-function middleware, validator, and cookie semantics"
```

---

### Task 2: useServerFn redirect gauge (start app)

Measures audit finding 8 (useServerFn drops redirect handling).

**Files:**
- Create: `apps/start/src/routes/redirector.tsx`
- Create: `apps/start/src/routes/redirector.stories.tsx`
- Modify: `e2e/start.spec.ts` (append)

**Interfaces:**
- Produces: route `/redirector` whose button triggers a server fn that throws `redirect({ to: "/redirector", search: { done: "yes" } })`; the page prints `done: yes` once the redirect is followed.

- [ ] **Step 1: Write the route**

`apps/start/src/routes/redirector.tsx`:

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

/**
 * A server fn that redirects back to this route with a search flag. The real
 * useServerFn catches the thrown redirect and navigates; the page re-renders
 * with done=yes. Self-referential so the gauge needs no other route.
 */
const login = createServerFn({ method: "POST" }).handler(() => {
  throw redirect({ to: "/redirector", search: { done: "yes" } });
});

export const Route = createFileRoute("/redirector")({
  validateSearch: (search: Record<string, unknown>) => ({
    done: typeof search.done === "string" ? search.done : "no",
  }),
  component: RedirectorPage,
});

function RedirectorPage() {
  const { done } = Route.useSearch();
  const run = useServerFn(login);
  return (
    <main>
      <h1>Redirector</h1>
      <p>done: {done}</p>
      <button type="button" onClick={() => void run({})}>
        log in
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Write the gauge story**

`apps/start/src/routes/redirector.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { Route } from "./redirector";

/** A thrown redirect from a server fn must navigate, not reject unhandled. */
const meta = {
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route, path: "/redirector" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof Route>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RedirectNavigates: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("done: no")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "log in" }));
    await expect(await canvas.findByText("done: yes")).toBeVisible();
  },
};
```

- [ ] **Step 3: Append the real-app proof**

Append to `e2e/start.spec.ts`:

```ts
test("a server fn that throws redirect() navigates the page", async ({ page }) => {
  await page.goto("/redirector");
  await expect(page.getByText("done: no")).toBeVisible();
  await page.getByRole("button", { name: "log in" }).click();
  await expect(page.getByText("done: yes")).toBeVisible();
});
```

- [ ] **Step 4: Run stories (expect the new one failing), then e2e (expect passing)**

Run: `npm run test --workspace=apps/start`
Expected: `RedirectNavigates` fails; the mock's `useServerFn` is a passthrough, the thrown redirect becomes an unhandled rejection and `done:` stays `no`.
Run: `npx playwright test e2e/start.spec.ts`
Expected: all pass.

- [ ] **Step 5: Check and commit**

Run: `npm run check`

```bash
git add apps/start/src/routes/redirector.tsx apps/start/src/routes/redirector.stories.tsx e2e/start.spec.ts
git commit -m "test: gauge useServerFn redirect handling"
```

---

### Task 3: createStart shape gauge (start app, stories only)

Measures audit finding 1 (`createStart()` returns `{}`). Deliberately NOT a route: a broken `createStart` must only fail this stories file, never cascade into the generated route tree that every tree-mode story imports.

**Files:**
- Create: `apps/start/src/start-instance.stories.tsx`

- [ ] **Step 1: Write the gauge stories**

`apps/start/src/start-instance.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { createStart } from "@tanstack/react-start";
import { expect } from "storybook/test";

/**
 * createStart() must return a start instance ({ getOptions, createMiddleware }).
 * Kept out of the route tree on purpose: if the mock crashes here it fails
 * only this file. No e2e twin; the contract is the package's own typed API.
 */
const startInstance = createStart(() => ({}));

function StartInstanceProbe() {
  const keys = Object.keys(startInstance).sort().join(", ");
  return <p>instance keys: {keys || "none"}</p>;
}

const meta = {
  component: StartInstanceProbe,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof StartInstanceProbe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InstanceShape: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/createMiddleware/u)).toBeVisible();
  },
};

export const GlobalMiddlewareSetup: Story = {
  play: async () => {
    const middleware = startInstance.createMiddleware({ type: "function" });
    await expect(typeof middleware.server).toBe("function");
  },
};
```

- [ ] **Step 2: Run stories; both must fail with the predicted shape**

Run: `npm run test --workspace=apps/start`
Expected: `InstanceShape` fails (`instance keys: none`), `GlobalMiddlewareSetup` fails (`startInstance.createMiddleware is not a function`). No other story file is affected.

- [ ] **Step 3: Check and commit**

Run: `npm run check`

```bash
git add apps/start/src/start-instance.stories.tsx
git commit -m "test: gauge the createStart instance shape"
```

---

### Task 4: Navigation seam gauges (router app)

Measures audit findings 7 (imperative navigation), 9/related (Link click behavior), 10 (Navigate mounted after a click crashes on Storybook preview hooks).

**Files:**
- Create: `apps/router/src/routes/nav-target.tsx`
- Create: `apps/router/src/routes/nav-probe.tsx`
- Create: `apps/router/src/navigation.stories.tsx`
- Modify: `e2e/router.spec.ts` (append)

**Interfaces:**
- Produces: routes `/nav-probe` (three triggers: a Link, a `useNavigate` button, a button that mounts `<Navigate>`) and `/nav-target` (heading `Nav target`).

- [ ] **Step 1: Write the routes**

`apps/router/src/routes/nav-target.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/nav-target")({
  component: () => <h1>Nav target</h1>,
});
```

`apps/router/src/routes/nav-probe.tsx`:

```tsx
import { Link, Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

/**
 * The three ways an app navigates, side by side. In the real app all three
 * land on /nav-target; a story should behave the same way.
 */
export const Route = createFileRoute("/nav-probe")({
  component: NavProbePage,
});

function NavProbePage() {
  const navigate = useNavigate();
  const [declarative, setDeclarative] = useState(false);
  if (declarative) {
    return <Navigate to="/nav-target" />;
  }
  return (
    <main>
      <h1>Nav probe</h1>
      <Link to="/nav-target">by link</Link>
      <button type="button" onClick={() => void navigate({ to: "/nav-target" })}>
        by hook
      </button>
      <button type="button" onClick={() => setDeclarative(true)}>
        by component
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Write the gauge stories (tree mode, whole app tree)**

`apps/router/src/navigation.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent } from "storybook/test";
import { routeTree } from "./routeTree.gen";

/**
 * Navigation gauges in tree mode: the story mounts the whole app tree at
 * /nav-probe, so /nav-target exists and every trigger has somewhere to go.
 * Real-app proof lives in e2e/router.spec.ts.
 */
function NavigationGauge() {
  return null;
}

const meta = {
  component: NavigationGauge,
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: routeTree, path: "/nav-probe" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof NavigationGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ByLink: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("link", { name: "by link" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};

export const ByHook: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "by hook" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};

export const ByComponent: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "by component" }));
    await expect(await canvas.findByRole("heading", { name: "Nav target" })).toBeVisible();
  },
};
```

Note: if the injected-component requirement makes tree mode reject a null component, mirror how `apps/router/src/tree-mode.stories.tsx` declares its meta component and keep the three plays unchanged.

- [ ] **Step 3: Append the real-app proof**

Append to `e2e/router.spec.ts`:

```ts
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
```

- [ ] **Step 4: Run stories and e2e; record which gauges fail where**

Run: `npm run test --workspace=apps/router`
Expected on the committed (`main`) channel:
- `ByLink` fails: the mocked Link records the click but blocks navigation.
- `ByHook` passes: `useNavigate` is currently backed by the real implementation and the whole tree is mounted, so in-tree navigation works. This is a control gauge; it pins the behavior stories may already rely on, so any future navigation-seam change that breaks it is visible.
- `ByComponent` fails: the mocked Navigate uses Storybook preview hooks and throws when mounted from a post-click re-render.
Run: `npx playwright test e2e/router.spec.ts`
Expected: all pass.

- [ ] **Step 5: Check and commit**

Run: `npm run check`

```bash
git add apps/router/src/routes/nav-target.tsx apps/router/src/routes/nav-probe.tsx apps/router/src/navigation.stories.tsx e2e/router.spec.ts
git commit -m "test: gauge link, hook, and component navigation in stories"
```

---

### Task 5: Re-measure all channels, record expectations, publish

**Files:**
- Modify: `expectations.json` (via `verify --update` only)
- Modify: `README.md` (generated sections only, via `scripts/docs.mjs`)

- [ ] **Step 1: Measure each channel in turn**

```bash
node scripts/channel.mjs main && npm install
node scripts/conformance-report.mjs
node scripts/verify.mjs main --update

node scripts/channel.mjs next && npm install
node scripts/conformance-report.mjs
node scripts/verify.mjs next --update

node scripts/channel.mjs patched && npm install
node scripts/conformance-report.mjs
node scripts/verify.mjs patched --update

git checkout -- apps package-lock.json && npm install
```

Expected: each `verify --update` reports the new stories as NEW FAILURE entries (except `ByHook`, which should pass everywhere). Every failure name must be one of the gauges added in Tasks 1-4; any OTHER new failure means an existing story regressed during this phase: stop and investigate before accepting.

- [ ] **Step 2: Regenerate README sections**

Run: `node scripts/docs.mjs`
Expected: story counts in the workspaces table and badges update to the new totals.

- [ ] **Step 3: Final check, commit, push**

Run: `npm run check && npm test`
Expected: `check` clean; `npm test` failures exactly match `expectations.json` (run `node scripts/verify.mjs main` without `--update` to confirm: zero drift).

```bash
git add expectations.json README.md
git commit -m "test: record the phase 0 instrument baselines for all channels"
git push origin main
```

Watch the Conformance workflow on GitHub: it must go green against the new expectations on all three channels.

---

## Self-review notes

- The elimination-plugin escape findings (audit finding 3) are deliberately NOT gauged here: in Storybook the mock executes handlers by design, so a story cannot observe the difference between eliminated and escaped code without also deciding what correct behavior is. That decision belongs to phase 2; the escapes are covered by unit tests in phase 1 where observable.
- `ByHook` is expected to PASS; it exists to pin the in-story navigation behavior that real projects (including the maintainer's) already rely on, before phase 2 touches the navigation seam.
- `createStart` has no e2e twin because evaluating the module in the real app requires importing it from a route, and a crash there would cascade into every tree-mode story via `routeTree.gen.ts`.
