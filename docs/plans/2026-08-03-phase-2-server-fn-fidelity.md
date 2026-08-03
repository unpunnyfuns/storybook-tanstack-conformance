# Phase 2: Server-function fidelity by delegation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a server function in a story run the same middleware chain, validator and redirect handling the real TanStack runtime runs, by delegating to `@tanstack/start-client-core` instead of reimplementing it.

**Architecture:** The real `createServerFn` already splits at `serverFnBaseToMiddleware`: its `client` phase calls `options.extractedFn` (the transport) and its `server` phase calls `options.serverFn` (the handler), with the validator applied as that middleware's `inputValidator`. `.handler()` takes both as arguments, `[extractedFn, serverFn]`. So the mock stops writing a builder and instead wraps the real one, passing an in-process transport that calls `__executeServer` rather than fetching. Middleware phases, validator, context merging and redirect parsing all come from real TanStack code.

**Tech Stack:** Storybook monorepo (`/Users/palnes/src/sbfork`), Vitest, Babel via `storybook/internal/babel`, TypeScript, seroval (already a dependency of `start-client-core`). Conformance suite (`/Users/palnes/src/conformance`), Playwright.

**Design document:** [phase 2 design](2026-08-02-phase-2-design.md). Read it before starting; it records why each decision was made and which alternatives were rejected.

## Global Constraints

- **Two repositories.** Framework work is in `/Users/palnes/src/sbfork`. Gauge stories and Playwright twins are in `/Users/palnes/src/conformance`. Each task names its repo. The Bash working directory persists between commands, so start every command with an explicit `cd`.
- **sbfork style:** single quotes, semicolons, match surrounding code exactly. No Prettier config, so never reformat existing lines. Conformance repo uses double quotes; do not carry its style into sbfork, and do not carry sbfork's into it.
- **No end-of-line comments. No em dashes in any committed text**, including commit messages.
- Every touched sbfork file must pass `cd /Users/palnes/src/sbfork/code && ../node_modules/.bin/oxfmt --check -c ../.oxfmtrc.json <file>` before committing. Commits bypass lint-staged (see below), so this check is not automatic.
- **sbfork test command, from the repo ROOT:** `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react`. From `code/` the workspace path doubles to `code/code/...` and vitest throws before running anything. Baseline on `upstream/next` is 79 tests in 6 files.
- **sbfork typecheck:** `cd /Users/palnes/src/sbfork/code/frameworks/tanstack-react && npx tsc --noEmit -p .`. Two pre-existing errors in `renderers/react` (`STORYBOOK_ENV`, `FRAMEWORK_OPTIONS`) are baseline noise; compare against exactly those two.
- husky pre-commit fails in this shell (`cross-env` not on PATH). Use `git commit --no-verify`.
- **Never push and never open or comment on a pull request or issue.** The repository owner files everything manually.
- Conformance repo gate before any commit there: `cd /Users/palnes/src/conformance && npm run check`.
- Diagnostics use `once.warn` from `storybook/internal/client-logger`, never bare `console.warn`. Phase 1 set that precedent.
- TDD with a captured failure: write the test, run it, paste the actual failure output into your report, then fix. A test that was never seen failing is not a guard.

## Branches

Each branch is one deliverable and becomes one upstream pull request. All branch off a freshly fetched `upstream/next`.

| Branch                                | Tasks         | Deliverable                                                          |
| ------------------------------------- | ------------- | -------------------------------------------------------------------- |
| conformance `main`                    | 1, 10         | Gauge instruments (no branch; the conformance repo is single-branch) |
| `fix/tanstack-cookie-scope`           | 2             | Cookie request/response split, header merge                          |
| `fix/tanstack-server-fn-delegation`   | 3, 4, 5, 6, 9 | The delegation swap, transport, serializer, `Response` branch, docs  |
| `fix/tanstack-use-server-fn-redirect` | 7             | `useServerFn` redirect handling                                      |
| `feat/tanstack-execute-server-fns`    | 8             | The opt-in framework option and eliminator carve-out                 |

Ordering is deliberate: the delegation swap lands before the framework option so the change in default behavior is reviewable on its own.

## File structure

**sbfork, `code/frameworks/tanstack-react/src/`:**

| File                                       | Responsibility                                                                                                                        | Change |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `export-mocks/server-fn-transport.ts`      | The in-process transport and the serializer round-trip. One responsibility, no Storybook coupling, unit-testable alone.               | Create |
| `export-mocks/server-fn-transport.test.ts` | Tests for the above.                                                                                                                  | Create |
| `export-mocks/start.ts`                    | The mock surface. Loses `createMockServerFnBuilder`, gains a thin delegating `createServerFn`. Cookie and header fixes land here too. | Modify |
| `export-mocks/start.test.ts`               | Tests for the mock surface.                                                                                                           | Modify |
| `export-mocks/start-storage-context.ts`    | Supplies the start context the call path reads.                                                                                       | Modify |
| `plugins/server-code-elimination.ts`       | The handler and validator strips become conditional.                                                                                  | Modify |
| `types.ts`                                 | `FrameworkOptions` gains the opt-in flag.                                                                                             | Modify |
| `preset.ts`                                | Threads the flag to the plugin.                                                                                                       | Modify |

**conformance, `apps/start/src/`:** `server-probe-fns.ts` and `routes/server-probes.tsx` gain a `Response`-returning probe; `routes/server-probes.stories.tsx` gains its gauge; `e2e/start.spec.ts` gains the twin.

---

### Task 1: Instrument the `Response` return (conformance repo)

Nothing currently measures what a real app does when a server function returns a `Response`. Per the roadmap's ordering principle, the instrument comes before the fix. This gauge is **expected to fail** until Task 6.

**Repo:** `/Users/palnes/src/conformance` (branch `main`, no feature branch)

**Files:**

- Modify: `apps/start/src/server-probe-fns.ts`
- Modify: `apps/start/src/routes/server-probes.tsx`
- Modify: `apps/start/src/routes/server-probes.stories.tsx`
- Modify: `e2e/start.spec.ts`
- Modify: `expectations.json` (via script only, never by hand)

**Interfaces:**

- Produces: an exported server function `respond` in `apps/start/src/server-probe-fns.ts` with signature `() => Promise<Response>`. The probe page calls `.text()` on the result, which is why the gauge asserts on the body string rather than the object. Task 6 makes the story pass.

- [ ] **Step 1: Add the probe server function**

Append to `apps/start/src/server-probe-fns.ts`:

```ts
/** A handler returning a Response is handed back raw, not serialized. */
export const respond = createServerFn({ method: "GET" }).handler(
  () => new Response("raw body", { status: 200 }),
);
```

- [ ] **Step 2: Render it on the probe page**

In `apps/start/src/routes/server-probes.tsx`, add `respond` to the import from `../server-probe-fns`, add a button and a result line, following the existing pattern exactly:

```tsx
<button type="button" onClick={record("raw", async () => (await respond()).text())}>
  respond
</button>
```

and alongside the other result paragraphs:

```tsx
<p>raw: {results.raw ?? "pending"}</p>
```

- [ ] **Step 3: Add the gauge story**

Append to `apps/start/src/routes/server-probes.stories.tsx`:

```tsx
/** A handler returning a Response is handed back raw, not serialized. */
export const ResponseReturn: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole("button", { name: "respond" }));
    await expect(await canvas.findByText("raw: raw body")).toBeVisible();
  },
};
```

- [ ] **Step 4: Add the Playwright twin**

Append inside the existing describe block in `e2e/start.spec.ts`, matching the file's existing style and the `toPass()` idiom used for click-then-assert against SSR dev servers:

```ts
test("a server function returning a Response is handed back raw", async ({ page }) => {
  await page.goto("/server-probes");
  await expect(async () => {
    await page.getByRole("button", { name: "respond" }).click();
    await expect(page.getByText("raw: raw body")).toBeVisible();
  }).toPass();
});
```

- [ ] **Step 5: Prove the twin passes against the real app**

Run: `cd /Users/palnes/src/conformance && npx playwright test e2e/start.spec.ts --reporter=line`
Expected: PASS. This is what makes `raw body` a measured value rather than a guess. **If it fails, stop and report**: the expected string is wrong and the gauge would be measuring the wrong thing.

- [ ] **Step 6: Confirm the gauge fails in Storybook**

Run: `cd /Users/palnes/src/conformance && npm run test --workspace=apps/start`
Expected: `Response Return` FAILS. Capture the verbatim output. This is the instrument working, not a bug.

- [ ] **Step 7: Record the new baseline**

The suite total changed, so every channel's expectations must be re-recorded. For each of `main`, `next`, `patched`:

```bash
cd /Users/palnes/src/conformance
node scripts/channel.mjs <channel>
rm -rf node_modules apps/*/node_modules package-lock.json
npm install --prefer-online --no-audit --no-fund
npm ls @storybook/tanstack-react @storybook/addon-vitest
node scripts/conformance-report.mjs
node scripts/verify.mjs <channel> --update
```

The `npm ls` check is not optional: an incremental install leaves the framework nested per-app while core stays on the old channel, and every suite then dies with `CriticalPresetLoadError`. Afterwards restore `main` and `git checkout -- package-lock.json`.

- [ ] **Step 8: Regenerate docs, gate, commit**

```bash
cd /Users/palnes/src/conformance
node scripts/docs.mjs
npm run format
npm run check
git add -A
git commit -m "test: gauge a server function returning a Response"
```

---

### Task 2: Split cookie request and response scope (findings 21 and 22)

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-cookie-scope` off `upstream/next`.

`setCookie` writes into the same `state.cookies` map that `getCookie` reads (`export-mocks/start.ts:449-455`), so a story can read back a cookie the real server never returns. The real runtime reads cookies from the request header only. `setResponseHeaders` also replaces the header set (`:383-385`), wiping any prior `Set-Cookie`, where the real one merges.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/start.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/start.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing other tasks call. Behavior only.

- [ ] **Step 1: Write the failing tests**

Append to `start.test.ts`, following the file's existing import and describe style:

```ts
describe("cookie scope", () => {
  it("does not read back a cookie it only wrote to the response", () => {
    setCookie("probe", "abc");
    expect(getCookie("probe")).toBeUndefined();
  });

  it("still records the write on the response headers", () => {
    setCookie("probe", "abc");
    expect(getResponseHeaders().get("set-cookie")).toContain("probe=abc");
  });
});

describe("setResponseHeaders", () => {
  it("merges onto existing headers instead of replacing them", () => {
    setCookie("probe", "abc");
    setResponseHeaders({ "x-custom": "1" });
    expect(getResponseHeaders().get("set-cookie")).toContain("probe=abc");
    expect(getResponseHeaders().get("x-custom")).toBe("1");
  });
});
```

Extend the file's existing import from `./start.ts` with any of `setCookie`, `getCookie`, `setResponseHeaders`, `getResponseHeaders` it does not already have. Check how the file resets state between tests and follow it; if it does not reset, add the same reset these tests need rather than inventing a new mechanism.

- [ ] **Step 2: Run and capture the failures**

Run: `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react/src/export-mocks/start.test.ts`
Expected: the first test fails because `getCookie` returns `'abc'`; the third fails because `set-cookie` was wiped. The second should already pass.

- [ ] **Step 3: Fix**

In `start.ts`, remove the request-store write from `setCookie` so it only records on the response:

```ts
export const setCookie = createNamedMock(
  "setCookie",
  (name: string, value: string, options?: Record<string, unknown>) => {
    getState().responseHeaders.append("set-cookie", serializeCookie(name, value, options));
  },
);
```

Apply the same reasoning to `deleteCookie`: it must not mutate `state.cookies` either, only append the expiring `set-cookie`.

Make `setResponseHeaders` merge:

```ts
export const setResponseHeaders = createNamedMock("setResponseHeaders", (headers: HeadersInit) => {
  const existing = getState().responseHeaders;
  new Headers(headers).forEach((value, key) => {
    existing.set(key, value);
  });
});
```

- [ ] **Step 4: Run the full suite and typecheck**

Run: `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react`
Expected: all pass. If an existing test asserted the old round-trip, that test was encoding the bug: update it and say so in your report.

- [ ] **Step 5: Revert check, format, commit**

`git stash` the source change only, re-run the test file, confirm the new tests fail again, `git stash pop`.

```bash
cd /Users/palnes/src/sbfork/code && ../node_modules/.bin/oxfmt --check -c ../.oxfmtrc.json frameworks/tanstack-react/src/export-mocks/start.ts frameworks/tanstack-react/src/export-mocks/start.test.ts
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/src/export-mocks/start.ts code/frameworks/tanstack-react/src/export-mocks/start.test.ts
git commit --no-verify -m "TanStack: Read cookies from the request and write them to the response, as the real runtime does"
```

---

### Task 3: Supply a start context so the server path can run

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-server-fn-delegation` off `upstream/next`.

`__executeServer` opens with `getStartContextServerOnly()` and immediately dereferences `startContext.contextAfterGlobalMiddlewares`. The mock's `createFallbackStartContext` returns `undefined` unless `__TSR_ROUTER__` or `__TSS_START_OPTIONS__` is set (`export-mocks/start-storage-context.ts:14-19`), so without this task every in-process call throws. Writing `__TSS_START_OPTIONS__` is also what lets `getStartOptions()?.functionMiddleware` find global middleware, which is what turns the `createStart` mock from shaped into wired.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/start.ts` (the `createStart` mock)
- Modify: `code/frameworks/tanstack-react/src/export-mocks/start-storage-context.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/start.test.ts`

**Interfaces:**

- Produces: after `createStart(getOptions)` is called, `globalThis.__TSS_START_OPTIONS__` holds the resolved options object, and `getStartContext()` returns a context whose `contextAfterGlobalMiddlewares` is an object rather than `undefined`. Task 5's transport depends on both.

- [ ] **Step 1: Write the failing tests**

```ts
describe("start context wiring", () => {
  it("publishes start options so getStartOptions can find them", () => {
    createStart(() => ({ functionMiddleware: [] }));
    expect((globalThis as any).__TSS_START_OPTIONS__).toEqual({ functionMiddleware: [] });
  });

  it("provides a start context with a defined post-global-middleware context", () => {
    createStart(() => ({}));
    const context = getStartContext();
    expect(context).toBeDefined();
    expect(context.contextAfterGlobalMiddlewares).toBeDefined();
  });
});
```

Import `getStartContext` from `./start-storage-context.ts`. Reset `globalThis.__TSS_START_OPTIONS__` between tests so the two do not leak into each other, and say in your report how you did it.

- [ ] **Step 2: Run and capture the failures**

Expected: the first fails because nothing writes the global; the second fails because `createFallbackStartContext` returns `undefined`.

- [ ] **Step 3: Fix**

In the `createStart` mock, publish the options as `hydrateStart` does in a real client bootstrap. Read `node_modules/@tanstack/start-client-core/src/client/hydrateStart.ts:15-24` first and mirror what it assigns, not more.

In `start-storage-context.ts`, make `createFallbackStartContext` return a usable context rather than `undefined`, with `contextAfterGlobalMiddlewares` defaulting to an empty object. Keep the existing `request` behavior; the wider storage-context rework is explicitly out of scope for this phase.

- [ ] **Step 4: Full suite, typecheck, revert check, format, commit**

```bash
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/src/export-mocks/start.ts code/frameworks/tanstack-react/src/export-mocks/start-storage-context.ts code/frameworks/tanstack-react/src/export-mocks/start.test.ts
git commit --no-verify -m "TanStack: Publish start options and a start context so the server path can run"
```

---

### Task 4: The serializer round-trip

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-server-fn-delegation` (continues from Task 3).

The real transport serializes with `toJSONAsync` and reads back with `fromCrossJSON`, using `getDefaultSerovalPlugins()` (`start-client-core/src/client-rpc/serverFnFetcher.ts:8,113-137`). An in-process call that skips this lets a story pass a function or class instance where the real app would reject it, and share object identity where the real app gives a copy.

**Files:**

- Create: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.ts`
- Create: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.test.ts`

**Interfaces:**

- Produces: `export async function roundTrip<T>(value: T): Promise<T>`. Serializes and deserializes through seroval with TanStack's default plugins, returning a structurally equal copy. Throws on non-serializable input. Task 5 calls it on both the payload and the result.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { roundTrip } from "./server-fn-transport.ts";

describe("roundTrip", () => {
  it("preserves plain data", async () => {
    await expect(roundTrip({ a: 1, b: "two" })).resolves.toEqual({ a: 1, b: "two" });
  });

  it("preserves types a structured clone would keep", async () => {
    const result = await roundTrip({ when: new Date(0), tags: new Set(["a"]) });
    expect(result.when).toBeInstanceOf(Date);
    expect(result.tags).toBeInstanceOf(Set);
  });

  it("returns a copy rather than the same reference", async () => {
    const original = { nested: { n: 1 } };
    const result = await roundTrip(original);
    expect(result).not.toBe(original);
    expect(result.nested).not.toBe(original.nested);
  });

  it("rejects a value the real transport could not send", async () => {
    await expect(roundTrip({ fn: () => "nope" })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run and capture the failure**

Run: `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.test.ts`
Expected: fails to resolve the module, since it does not exist yet.

- [ ] **Step 3: Implement**

```ts
import { getDefaultSerovalPlugins } from "@tanstack/start-client-core";
import { fromCrossJSON, toJSONAsync } from "seroval";

let plugins: ReturnType<typeof getDefaultSerovalPlugins> | null = null;

function getPlugins() {
  if (!plugins) {
    plugins = getDefaultSerovalPlugins();
  }
  return plugins;
}

/**
 * Mirrors what the real transport does to values crossing the wire, so a story
 * cannot pass something the server would reject and cannot share a reference
 * the real app would have copied.
 */
export async function roundTrip<T>(value: T): Promise<T> {
  const serialized = await toJSONAsync(value, { plugins: getPlugins() });
  return fromCrossJSON(serialized, { refs: new Map(), plugins: getPlugins() }) as T;
}
```

Verify the `fromCrossJSON` call signature against how `serverFnFetcher.ts` invokes it and match that, rather than trusting this sketch. If `seroval` is not resolvable as a direct import, note that it is a transitive dependency via `start-client-core` and report how you resolved it before proceeding.

- [ ] **Step 4: Run, format, commit**

```bash
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.ts code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.test.ts
git commit --no-verify -m "TanStack: Add the serializer round-trip the in-process transport needs"
```

---

### Task 5: Delegate `createServerFn` to the real implementation

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-server-fn-delegation` (continues from Task 4).

This is the core of the phase. `createMockServerFnBuilder` (`start.ts:573-609`) is deleted and replaced with a wrapper over the real `createServerFn`, which passes an in-process transport as `.handler()`'s first argument.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.ts`
- Modify: `code/frameworks/tanstack-react/src/export-mocks/start.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.test.ts`, `start.test.ts`

**Interfaces:**

- Consumes: `roundTrip` from Task 4; the start context from Task 3.
- Produces: `createServerFn` whose `.handler()` returns a `fn()` spy. The spy's default implementation runs the real chain. `mockResolvedValue` and `toHaveBeenCalledWith` keep working.

- [ ] **Step 1: Write the failing tests**

```ts
describe("createServerFn delegation", () => {
  it("runs the client middleware phase", async () => {
    const seen: Array<string> = [];
    const mw = createMiddleware({ type: "function" }).client(({ next }) => {
      seen.push("client");
      return next();
    });
    const call = createServerFn({ method: "GET" })
      .middleware([mw])
      .handler(() => "ok");
    await expect(call()).resolves.toBe("ok");
    expect(seen).toEqual(["client"]);
  });

  it("runs the server middleware phase and passes its context to the handler", async () => {
    const mw = createMiddleware({ type: "function" }).server(({ next }) =>
      next({ context: { user: "ada" } }),
    );
    const call = createServerFn({ method: "GET" })
      .middleware([mw])
      .handler(({ context }: any) => context.user);
    await expect(call()).resolves.toBe("ada");
  });

  it("applies the validator before the handler", async () => {
    const call = createServerFn({ method: "POST" })
      .validator(Number)
      .handler(({ data }: any) => data + 1);
    await expect(call({ data: "1" })).resolves.toBe(2);
  });

  it("is still a spy that a story can override", async () => {
    const call = createServerFn({ method: "GET" }).handler(() => "real");
    call.mockResolvedValue("mocked");
    await expect(call()).resolves.toBe("mocked");
    expect(call).toHaveBeenCalled();
  });

  it("runs the real chain again after a mock reset", async () => {
    const call = createServerFn({ method: "GET" }).handler(() => "real");
    call.mockResolvedValue("mocked");
    call.mockReset();
    await expect(call()).resolves.toBe("real");
  });
});
```

The last test is the load-bearing compatibility guard identified in the design: Storybook resets mocks automatically between stories, and a default implementation that does not survive reset would make every server function silently return `undefined` in a real session while unit tests stayed green.

- [ ] **Step 2: Run and capture the failures**

Expected: the middleware and validator tests fail because the current builder discards both; the reset test fails or passes for the wrong reason. Capture all of it.

- [ ] **Step 3: Add the transport to `server-fn-transport.ts`**

```ts
/**
 * Stands in for the RPC stub TanStack's compiler generates. The real one
 * serializes and fetches; this one serializes and calls the server half in
 * process, so no request leaves the browser.
 */
export function createInProcessTransport() {
  const built: { current?: { __executeServer: (opts: any) => Promise<any> } } = {};

  const transport = async (payload: any) => {
    const sent = await roundTrip(payload);
    const result = await built.current!.__executeServer(sent);
    return roundTrip(result);
  };

  return { transport, bind: (fn: typeof built.current) => (built.current = fn) };
}
```

The mutable holder is deliberate: the transport needs a reference to the object `.handler()` returns, which does not exist until after `.handler()` is called. The transport is only invoked later, so binding afterwards is safe.

- [ ] **Step 4: Replace the builder in `start.ts`**

Delete `createMockServerFnBuilder` and rewrite `createServerFn` to wrap the real one. The shape to aim for, adapted to what you find in the file:

```ts
export const createServerFn: typeof _createServerFn = (options?: any) => {
  return wrapBuilder(realCreateServerFn(options));
};
```

where `wrapBuilder` returns a proxy of the real builder whose chain methods re-wrap, and whose `handler(userHandler)` does:

```ts
const { transport, bind } = createInProcessTransport();
const real = builder.handler(transport, userHandler);
bind(real);
return fn(real).mockName("@tanstack/start-client-core::createServerFn.handler()");
```

`fn(impl)` rather than `fn().mockImplementation(impl)` is what makes the reset test pass: vitest restores the implementation a mock was constructed with. **Verify that on the installed vitest before relying on it.** If it does not hold, report it and implement the reset survival another way rather than dropping the test.

Import the real `createServerFn` from `@tanstack/start-client-core`, which the interception plugin does not redirect, using the same import the file already has at its top.

- [ ] **Step 5: Full suite, typecheck, revert check, format, commit**

Expected: all pass. Existing tests that asserted the old discard-everything behavior were encoding the bug; update them and say so.

```bash
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/src/export-mocks/
git commit --no-verify -m "TanStack: Run the real middleware chain and validator in stories"
```

The remaining steps are a second, separate commit on the same branch. They exist because of the design correction recorded in the ledger on 2026-08-03: global function middleware cannot run in a Storybook build at all, because `getStartOptions` is built on `createIsomorphicFn`, which the runtime ships as an explicit dummy that discards both implementations and expects a compiler transform that never runs on `node_modules`. The delegation this task just landed makes that gap reachable by story authors for the first time, so it ships with a warning and an escape hatch rather than silently.

Note the contrast that makes the hatch possible, because it is easy to conflate the two helpers: `getStartContextServerOnly` is built on `createServerOnlyFn`, which is plain identity (`(fn) => fn`), and it resolves `getStartContext` from `@tanstack/start-storage-context`, a specifier `plugins/module-interception.ts` **does** redirect to our own mock. So the start context is ours to populate; the start options are not.

- [ ] **Step 6: Write the failing tests**

In `start.test.ts`, mirroring the mocking pattern the phase 1 branch `fix/tanstack-missing-params-warning` established (`vi.mock` on the logger module, which also sidesteps `once`'s message deduplication across tests):

```ts
vi.mock("storybook/internal/client-logger");
```

```ts
describe("global function middleware", () => {
  it("warns that configured global middleware will not run", () => {
    createStart(() => ({
      functionMiddleware: [createMiddleware({ type: "function" })],
    }));
    expect(once.warn).toHaveBeenCalledWith(expect.stringContaining("functionMiddleware"));
  });

  it("does not warn when no global middleware is configured", () => {
    createStart(() => ({}));
    expect(once.warn).not.toHaveBeenCalled();
  });
});
```

In `start-storage-context.test.ts` (create it if absent), for the escape hatch:

```ts
it("seeds contextAfterGlobalMiddlewares from the story's start context", () => {
  setStoryStartContext({ user: "ada" });
  expect(getStartContext().contextAfterGlobalMiddlewares).toEqual({ user: "ada" });
});

it("falls back to an empty object when a story sets no context", () => {
  setStoryStartContext(undefined);
  expect(getStartContext({ throwIfNotFound: false })?.contextAfterGlobalMiddlewares).toEqual({});
});
```

And the end-to-end assertion in `start.test.ts`, which is the one that proves the hatch actually reaches a handler:

```ts
it("passes the story's start context to the handler", async () => {
  setStoryStartContext({ user: "ada" });
  const call = createServerFn({ method: "GET" }).handler(({ context }: any) => context.user);
  await expect(call()).resolves.toBe("ada");
});
```

- [ ] **Step 7: Run and capture the failures**

Expected: the warning tests fail because `createStart` does not warn; the hatch tests fail because `setStoryStartContext` does not exist.

- [ ] **Step 8: Add the warning to `createStart`**

In `start.ts`, after the options are resolved (both the sync and the awaited-async path from Task 3, so an async config function warns too), warn once when `functionMiddleware` is a non-empty array. Use `once.warn` from `storybook/internal/client-logger`, matching the framework's existing logging call. The message must say what does not happen and what to do instead: that global function middleware does not run in Storybook, and that `parameters.tanstack.start.context` supplies the context such middleware would have produced.

Do not warn on an empty array or a missing key. Most apps configure neither.

- [ ] **Step 9: Add the story start context**

**`setStoryStartContext` must not become an export of `export-mocks/start-storage-context.ts`.** `plugins/module-interception.ts:45` redirects `@tanstack/start-storage-context` to that file, so every export in it is importable under the real package's specifier and becomes public API no real app has. This is the exact defect that blocked Task 2's round 0; read that ledger entry before writing this step. Key the value off a module-local `Symbol.for(...)` on `globalThis`, exactly as `START_CONTEXT_SYMBOL` already does in the same file, and have `createFallbackStartContext` read it:

```ts
const STORY_CONTEXT_SYMBOL = Symbol.for("storybook.tanstack-react.story-start-context");
```

```ts
contextAfterGlobalMiddlewares: browserGlobals[STORY_CONTEXT_SYMBOL] ?? {},
```

The `?? {}` preserves Task 3's guarantee that this field is never `undefined`, which is what stops `__executeServer` throwing.

The writer is the decorator, which is the only place with the story's parameters. In `routing/decorator.tsx`, inside `tanstackRouteDecorator` (line 50) before it renders, set the symbol from `context.parameters.tanstack?.start?.context`. Set it on every story, including to `undefined` when the parameter is absent, so one story's context cannot leak into the next: Storybook keeps preview modules alive across navigations.

Add the parameter to the public type in `types.ts`, alongside `router` in `TanStackPreviewOptions`:

```ts
export interface StartParameters {
  /**
   * Context a story supplies in place of global function middleware, which
   * cannot run in a Storybook build. Merged as the base context for server
   * function handlers, exactly where `contextAfterGlobalMiddlewares` lands.
   */
  context?: Record<string, unknown>;
}
```

```ts
  /** TanStack Start configuration for stories. */
  start?: StartParameters;
```

Export `StartParameters` from `index.ts` beside `RouterParameters` (line 34).

- [ ] **Step 10: Full suite, typecheck, format, commit**

```bash
cd /Users/palnes/src/sbfork
npx vitest run code/frameworks/tanstack-react
git add code/frameworks/tanstack-react/src/
git commit --no-verify -m "TanStack: Warn that global middleware cannot run, and let a story supply its context"
```

---

### Task 6: Hand back a `Response` unserialized

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-server-fn-delegation` (continues from Task 5).

The real server side branches on `unwrapped instanceof Response` and returns it raw (`start-server-core/src/server-functions-handler.ts:174`). Passing a `Response` through `roundTrip` would either throw or mangle it. This is what makes Task 1's gauge go green.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/server-fn-transport.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("hands a Response back without serializing it", async () => {
  const call = createServerFn({ method: "GET" }).handler(
    () => new Response("raw body", { status: 200 }),
  );
  const result = await call();
  expect(result).toBeInstanceOf(Response);
  await expect(result.text()).resolves.toBe("raw body");
});
```

- [ ] **Step 2: Run and capture the failure**

Expected: fails, because `roundTrip` cannot serialize a `Response`.

- [ ] **Step 3: Fix**

In `createInProcessTransport`, skip the result round-trip when the value is a `Response`:

```ts
const result = await built.current!.__executeServer(sent);
return result instanceof Response ? result : roundTrip(result);
```

- [ ] **Step 4: Full suite, revert check, format, commit**

```bash
git commit --no-verify -m "TanStack: Hand a Response back raw instead of serializing it"
```

---

### Task 7: `useServerFn` handles redirects (finding 8)

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-use-server-fn-redirect` off `upstream/next`.

`useServerFn` (`start.ts:564-571`) is a bare passthrough, so a server function throwing `redirect()` becomes an unhandled rejection and nothing records a navigation. The real one catches `isRedirect(err)` and navigates. The real caller already rethrows a proper redirect object via `parseRedirect`, so this is a catch-and-navigate.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/start.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/start.test.ts`

- [ ] **Step 1: Write the failing test**

`useServerFn` is a React hook, so it cannot be called directly. The package already has the precedent you need: `export-mocks/react-router.test.ts` renders a component in `happy-dom` via a `// @vitest-environment happy-dom` file pragma, because the package's vitest environment defaults to `node`. Read that file first and follow it exactly.

```ts
// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import React from "react";
import { redirect } from "@tanstack/react-router";
import { onNavigate } from "./spies.ts";
import { useServerFn } from "./start.ts";

it("navigates instead of rejecting when a server function throws a redirect", async () => {
  const failing = async () => {
    throw redirect({ to: "/after" });
  };
  let call: (() => Promise<unknown>) | undefined;

  function Probe() {
    call = useServerFn(failing);
    return null;
  }
  render(React.createElement(Probe));

  await expect(call!()).resolves.toBeUndefined();
  expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/after" }));
});
```

If `@testing-library/react` is not what the sibling test uses, use whatever it does use rather than adding a dependency, and report the difference.

- [ ] **Step 2: Run and capture the failure**

Expected: the call rejects and `onNavigate` was never called.

- [ ] **Step 3: Fix**

Wrap the callback so a redirect is caught and recorded rather than escaping. Use `isRedirect` from `@tanstack/react-router` if the mock surface already re-exports it; check before adding an import. Record via `onNavigate` from `./spies.ts`, which is how the rest of the navigation seam reports.

- [ ] **Step 4: Full suite, typecheck, revert check, format, commit**

```bash
git commit --no-verify -m "TanStack: Navigate when a server function throws a redirect"
```

---

### Task 8: The opt-in framework option

**Repo:** `/Users/palnes/src/sbfork`, branch `feat/tanstack-execute-server-fns` off `upstream/next`.

The chain runs regardless, but `__executeServer` can only invoke a handler still in the bundle, and the eliminator strips `.handler()` and `.validator()`. This adds the opt-in that suspends both strips. It lands last so the default-behavior change from Tasks 3 to 6 is reviewable on its own.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/types.ts`
- Modify: `code/frameworks/tanstack-react/src/preset.ts`
- Modify: `code/frameworks/tanstack-react/src/plugins/server-code-elimination.ts`
- Test: `code/frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts`

**Interfaces:**

- Produces: `FrameworkOptions.executeServerFunctions?: boolean`, default `false`. When true, `serverCodeEliminationPlugin` keeps `.handler()` and `.validator()` calls intact.

- [ ] **Step 1: Write the failing tests**

```ts
describe("executeServerFunctions option", () => {
  const SOURCE = `
import { createServerFn } from '@tanstack/react-start';
export const probe = createServerFn().validator(Number).handler(async () => 'secret');
`;

  it("strips the handler by default", async () => {
    const result = await transform(SOURCE, "/app/src/fn.ts");
    expect(result?.code).not.toContain("secret");
  });

  it("keeps the handler and validator when the option is on", async () => {
    const result = await transformWithOptions(SOURCE, "/app/src/fn.ts", {
      executeServerFunctions: true,
    });
    expect(result?.code).toContain("secret");
    expect(result?.code).toContain("validator");
  });
});
```

Add a `transformWithOptions` helper beside the file's existing `transform` helper, passing the option through to `serverCodeEliminationPlugin`. Read the existing helper first and mirror it.

- [ ] **Step 2: Run and capture the failure**

Expected: the first passes, the second fails because the plugin takes no such option yet.

- [ ] **Step 3: Add the option**

In `types.ts`, extend `FrameworkOptions` with a documented field, matching the style of the existing `generatedRouteTree` doc comment:

```ts
  /**
   * Keep server function handlers and validators in the Storybook build so a
   * story runs the real chain end to end instead of supplying its own handler.
   *
   * Off by default. Only enable it when every server function's imports are
   * either TanStack's own, which the preset already intercepts, or covered by
   * a `__mocks__` file. A handler that reaches `node:fs` or a database client
   * will fail the browser build.
   */
  executeServerFunctions?: boolean;
```

Thread it from `preset.ts` into `serverCodeEliminationPlugin`, following how `preset.ts` already reads framework options.

In `server-code-elimination.ts`, gate on the option **every strip that would stop the real chain running end to end**, and leave the rest alone. Do not take the following list on trust; derive the exact set from the source, because the method names in the AST are not the ones the mock's public surface advertises. At minimum, `createServerFn(...).handler(fn)` at line 167 and the middleware `server` / `inputValidator` strip at lines 185-187 are all in scope. Note that the real builder's validator method is `inputValidator` while the mock exposes `validator`, and that `createMiddleware` has an `inputValidator` of its own, so "the validator strip" is ambiguous until you read it.

The middleware `server` phase belongs in scope and an earlier draft of this plan wrongly excluded it. Task 5's tests prove the server middleware phase runs and seeds the handler's context, but those tests run in Node with no eliminator. In a real build this strip deletes the user's `.server()` call before it can run, so an opt-in that suspends only the handler strip would execute the handler with none of the context its middleware was supposed to provide. That is the divergence this phase exists to remove, reintroduced one layer down.

Two strips stay unconditional, and for a stated reason rather than by omission:

- The route `server:` property strip. Route server handlers are a different seam from server functions and this option says nothing about them.
- `createServerOnlyFn` and `createIsomorphicFn`. `createIsomorphicFn` in particular has an explicit client implementation that is the right one to run in a browser, so keeping the server half would drag genuinely server-only code into the bundle while producing a _less_ representative result, not a more representative one.

Add a test asserting a middleware `server` phase survives with the option on, alongside the handler test.

- [ ] **Step 4: Full suite, typecheck, revert check, format, commit**

```bash
git commit --no-verify -m "TanStack: Add an opt-in to execute server functions in stories"
```

---

### Task 9: Document what a story can and cannot know

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-server-fn-delegation` (final task on that branch).

The docs page says handlers "are replaced with mock functions", which stops being the whole truth. This is a deliverable of the phase, not a follow-up.

**Files:**

- Modify: `docs/get-started/frameworks/tanstack-react.mdx`

- [ ] **Step 1: Read the surrounding sections**

Read `docs/get-started/frameworks/tanstack-react.mdx` from "Mocking server functions in stories" through the end of "Handling server-only dependencies". The new content slots beside them and must reuse their vocabulary rather than introduce a parallel one.

- [ ] **Step 2: Update the existing claim**

Correct the line stating that `createServerFn()` handlers "are replaced with mock functions" so it says what is now true: the exported symbol is still a mock you can override, and if you do not override it the real middleware chain and validator run.

- [ ] **Step 3: Add the new section**

Cover, in prose matching the page's register:

- The middleware chain and validator execute for real in stories.
- Where the transport boundary sits, and that there is no server: the call never leaves the browser.
- Values crossing that boundary are serialized exactly as the real transport serializes them, so a story cannot pass something a server would reject. Streamed returns are a known exception.
- Mocking a server function still short-circuits the chain, so the documented `mockResolvedValue` pattern is unchanged.
- What `executeServerFunctions` does, its `__mocks__` precondition, and when not to enable it.
- A callout for the breaking part: unmocked calls now run middleware and validators, so middleware side effects fire and invalid input is rejected where it previously was not.

- [ ] **Step 4: Commit**

```bash
cd /Users/palnes/src/sbfork
git add docs/get-started/frameworks/tanstack-react.mdx
git commit --no-verify -m "TanStack: Document that stories now run the real server function chain"
```

---

### Task 10: Prove the chain survives a mock reset in a real session (conformance repo)

**Repo:** `/Users/palnes/src/conformance` (branch `main`)

Task 5's unit test covers reset survival in isolation. The design flags this as the failure mode that passes unit tests and only shows up in a real Storybook session, because Storybook's automatic reset runs between stories rather than inside one. This gauge closes that gap.

**Files:**

- Modify: `apps/start/src/routes/server-probes.stories.tsx`

- [ ] **Step 1: Add the gauge**

Add a story that calls a server function without mocking it, in a file where an earlier story has mocked one, so the automatic reset has run in between. Assert the real chain result rather than `undefined`. Reuse the existing probe functions; do not add new ones.

Carry `tags: ["ai-generated"]` as the repo requires, and follow the existing gauge comment style explaining what the real app does.

- [ ] **Step 2: Confirm it fails before the framework fix and passes after**

On the `main` channel this gauge is expected to fail, since the published framework has none of this work. Record that. It goes green on `patched` once the delegation branch is composed into the tarball, which is a separate release decision and not part of this plan.

- [ ] **Step 3: Re-record expectations, gate, commit**

Follow Task 1 Step 7's channel procedure exactly, including the `npm ls` check, then:

```bash
cd /Users/palnes/src/conformance
node scripts/docs.mjs
npm run format
npm run check
git add -A
git commit -m "test: gauge that a server function still runs its chain after a mock reset"
```

---

## After all tasks

Composing these branches into the `patched` channel is a release decision for the repository owner, not an implementation step, exactly as in phase 1. Upstream pull requests are filed manually.

Carry these into each pull request body, from the design document:

- The delegation swap is a **breaking change** for unmocked calls: middleware side effects now fire, validators now reject input that previously passed, and `setCookie` followed by `getCookie` stops round-tripping. It needs a release note.
- **Global function middleware cannot run in a Storybook build at all**, and no work in this phase changes that. `getStartOptions` is built on `createIsomorphicFn`, which the runtime ships as an explicit dummy discarding both implementations, and it lives in `@tanstack/start-client-core`, which is neither intercepted nor transformed because the eliminator excludes `/node_modules/`. So `getStartOptions()?.functionMiddleware || []` is always `[]`. Task 5 ships a `once.warn` for anyone who configures global middleware, and a `parameters.tanstack.start.context` escape hatch that seeds `contextAfterGlobalMiddlewares` with what such middleware would have produced. Per-function middleware and validators are unaffected.
- An **earlier draft of this section claimed `fix/tanstack-isomorphic-order` from phase 1 was a prerequisite** for global middleware. That was wrong and is recorded here so it does not get re-asserted: that fix transforms user code, while the chain that matters is inside `node_modules` and is never transformed by anything in a Storybook build.
- `feat/tanstack-execute-server-fns` is **not safe to merge before `fix/tanstack-server-fn-delegation`**. The current mock invokes a handler it is given while discarding middleware and validators, so enabling the option without the delegating mock makes handler bodies execute silently with `opts.context` undefined and unvalidated input. The option ships marked experimental and documented to that effect, but the sequencing is a release decision.
- **The docs page cannot be reviewed against any single branch.** Three of its claims are deliberately cross-branch: `executeServerFunctions`, the cookie paragraph, and every statement about validators. The page is correct for the shipping combination and false for `fix/tanstack-server-fn-delegation` alone. Reviewing it branch-locally will produce false findings in both directions.
- **If the validator integration fix below lands, four passages in `docs/get-started/frameworks/tanstack-react.mdx` must revert in the same commit**, because the page currently documents the inconsistency rather than the intended design: the third item at `:157`, the last clause of `:199`, all of `:212`, and the "does not restore validators" clause at `:389`.
- **REQUIRED INTEGRATION FIX, found by the task 9 docs review on 2026-08-03.** Phase 1's `fix/tanstack-strip-validator` (`555ce27`) adds a `createServerFn().validator()` / `.inputValidator()` strip that did not exist when `feat/tanstack-execute-server-fns` was written, so the opt-in does not gate it. In the shipping combination the server function's own validator therefore runs **neither by default nor under the opt-in**, which contradicts what the phase 2 design requires of itself: "phase 1 task 2's strip is correct for a client bundle and must be suspended for exactly the same builds that keep the handler." Whoever integrates these branches must extend the `executeServerFunctions` gate to cover that strip, and must do it in the same change that brings the two branches together, because neither branch can express it alone.
- The `optimizeDeps.exclude` fix on the delegation branch corrects a **latent pre-existing bug**, not just a new one: `plugins/module-interception.ts` redirected `@tanstack/start-storage-context` via a `resolveId` hook while omitting it from `optimizeDeps.exclude`, and Vite's dep pre-bundler does not run user `resolveId` hooks. It never bit because nothing traversed from inside `@tanstack/start-client-core` into the storage context until this phase made `__executeServer` run. It is dev-server-only; production Rollup runs the hook.
- Streamed and raw-stream returns travel over TanStack's frame protocol, which the in-process transport does not reproduce. Documented divergence.

## Self-review notes

- Task 1 and Task 10 both re-record `expectations.json` across three channels, which is the slowest step in the plan. If they are executed back to back, record once after both rather than twice.
- Tasks 3 to 6 and Task 9 share one branch and must run in order; each still ends at an independently testable state.
- Task 2 (cookies) and Task 7 (redirects) are independent of everything else and can be done in any order relative to the delegation branch.
- The `Cookie Scope` gauge needs both Task 2 and the delegation branch to go green, because it calls a server function whose handler must run before the cookie semantics are observable. Do not expect Task 2 alone to flip it.
