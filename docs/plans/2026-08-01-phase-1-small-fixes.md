# Phase 1: Small Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land nine independent fixes in `@storybook/tanstack-react`, each with a test that provably failed first, each on its own branch so it can become one small upstream pull request. Eight are a few lines each; task 9, added later, adopts a larger self-contained branch that was already written.

**Architecture:** Every task is self-contained: branch off `upstream/next`, write the failing test, capture the failure, apply the minimal fix, prove the test guards (revert check), push the branch to the fork. No task depends on another; they can land upstream in any order. Larger semantic changes (navigation seam, leaf resolution, mock execution pipeline) are explicitly out of scope; they are phase 2.

**Tech Stack:** Storybook monorepo (`/Users/palnes/src/sbfork`), Vitest, Babel (via `storybook/internal/babel`), TypeScript.

## Contents

- [Global Constraints](#global-constraints)
  - [Task 1: Widen the elimination plugin's file filter (finding 3, id part)](#task-1-widen-the-elimination-plugins-file-filter-finding-3-id-part)
  - [Task 2: Strip `.validator()` from client bundles (findings 19 and part of 3)](#task-2-strip-validator-from-client-bundles-findings-19-and-part-of-3)
  - [Task 3: Make createIsomorphicFn order-independent (finding 6)](#task-3-make-createisomorphicfn-order-independent-finding-6)
  - [Task 4: Navigate must not use Storybook preview hooks (finding 10)](#task-4-navigate-must-not-use-storybook-preview-hooks-finding-10)
  - [Task 5: createStart returns a start instance (finding 1)](#task-5-createstart-returns-a-start-instance-finding-1)
  - [Task 6: Remove the dead optimizeDeps export (finding 25)](#task-6-remove-the-dead-optimizedeps-export-finding-25)
  - [Task 7: Export the override types and allow `__root__` (findings 26 part, 5 of the integration audit)](#task-7-export-the-override-types-and-allow-__root__-findings-26-part-5-of-the-integration-audit)
  - [Task 8: Warn when path params are missing (finding 14)](#task-8-warn-when-path-params-are-missing-finding-14)
  - [Task 9: Connect the app's generated route tree (added 2026-08-04)](#task-9-connect-the-apps-generated-route-tree-added-2026-08-04)
- [After all tasks](#after-all-tasks)
- [Self-review notes](#self-review-notes)

## Global Constraints

- Repo: `/Users/palnes/src/sbfork`. Before each task: `git fetch upstream && git checkout -b <branch> upstream/next`.
- Style: single quotes, match surrounding code exactly; the repo has no Prettier config, so never run a formatter over existing lines. No end-of-line comments.
- Test command: `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react` (full framework suite; baseline on `upstream/next` is 79 tests in 6 files as of 2026-08-02, measured on a pristine checkout. Tasks 1 to 8 measure against that. Task 9's branch is the exception: it adds two preset plugins with their own tests and reports 88 in 8, so measure it against its own base rather than against this number. Scope to a single file by appending its path). Run it from the repo ROOT: from `code/` the workspace config path doubles to `code/code/...` and vitest throws before running anything.
- Typecheck command: `cd /Users/palnes/src/sbfork/code/frameworks/tanstack-react && npx tsc --noEmit -p .`. Two pre-existing errors in `renderers/react` (`STORYBOOK_ENV`, `FRAMEWORK_OPTIONS`) are baseline noise, not yours; compare against them rather than expecting zero output.
- **Typechecking is not enough for a branch that changes the type of anything exported.** `--noEmit` skips declaration emit, so it cannot see an inferred type that has no portable name in a `.d.ts` (`TS2883`). Task 4 of this plan shipped that exact defect: returning the real `createMiddleware` from `createStart` made the inferred type reference `CreateMiddlewareFn` through a `node_modules` path, and the package build failed while the typecheck stayed clean. Found on 2026-08-03 while composing the release, fixed on the branch in `046bf06` with an explicit return annotation. Such a branch also needs `cd /Users/palnes/src/sbfork/scripts && PATH="/Users/palnes/src/sbfork/node_modules/.bin:$PATH" NODE_ENV=production jiti ./build-package.ts tanstack-react --no-watch --prod`.
- TDD with a revert check: after the fix passes, `git stash` the src change, confirm the new test fails, `git stash pop`. A test that cannot fail is not a guard.
- Push branches to `origin` (the fork). NEVER open a pull request; the repository owner files PRs manually with AI disclosure.
- Branch naming: `fix/tanstack-<slug>` as given per task.
- Audit references: finding numbers refer to `docs/audits/2026-08-01-framework-audit.md` in the conformance repo.
- No em dashes in any committed text.

All paths below are relative to `code/frameworks/tanstack-react/`.

---

### Task 1: Widen the elimination plugin's file filter (finding 3, id part)

Branch: `fix/tanstack-elimination-id-filter`

The transform filter only matches ids ending in `.ts`/`.tsx`, so `.js`/`.jsx`/`.mjs` sources and any id carrying a Vite query (`?v=`, `?t=`, `?tsr-split=`) bypass elimination entirely. TanStack's own pipeline uses `/\.[cm]?[tj]sx?($|\?)/`.

**Files:**

- Modify: `src/plugins/server-code-elimination.ts` (the `transform.filter.id.include` array and the handler's extension regex)
- Test: `src/plugins/server-code-elimination.test.ts`

**Interfaces:**

- Produces: a `transformThroughFilter` test helper other elimination tests can adopt later. Signature: `transformThroughFilter(code: string, id: string): Promise<{ code: string } | null | undefined>`.

- [ ] **Step 1: Write the failing tests, routed through the plugin's real filter**

The existing tests call `plugin.transform.handler` directly, which is why this gap is invisible. Add to `src/plugins/server-code-elimination.test.ts`:

```ts
const SERVER_FN_SOURCE = `
import { createServerFn } from '@tanstack/react-start';
export const probe = createServerFn().handler(async () => 'secret');
`;

async function transformThroughFilter(code: string, id: string) {
  const plugin = serverCodeEliminationPlugin() as any;
  const { filter, handler } = plugin.transform;
  const included = filter.id.include.some((re: RegExp) => re.test(id));
  const excluded = (filter.id.exclude ?? []).some((re: RegExp) => re.test(id));
  if (!included || excluded || !filter.code.test(code)) {
    return null;
  }
  return handler.call({}, code, id);
}

describe("transform.filter id coverage", () => {
  it("transforms .jsx sources", async () => {
    const result = await transformThroughFilter(SERVER_FN_SOURCE, "/app/src/routes/x.jsx");
    expect(result?.code).toContain("__sb");
  });

  it("transforms ids carrying a Vite query", async () => {
    const result = await transformThroughFilter(SERVER_FN_SOURCE, "/app/src/routes/x.tsx?v=abc123");
    expect(result?.code).toContain("__sb");
  });

  it("transforms code-splitter ids", async () => {
    const result = await transformThroughFilter(
      SERVER_FN_SOURCE,
      "/app/src/routes/x.tsx?tsr-split=component",
    );
    expect(result?.code).toContain("__sb");
  });

  it("still skips node_modules", async () => {
    const result = await transformThroughFilter(SERVER_FN_SOURCE, "/app/node_modules/lib/x.tsx");
    expect(result).toBeNull();
  });
});
```

Adjust the `__sb` expectation to whatever marker the existing happy-path tests assert on (the spy import or wrapper call the plugin emits); copy the exact expectation string from the nearest existing `.handler()` test so the new tests and old tests assert the same transform.

- [ ] **Step 2: Run and capture the failures**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts`
Expected: the three new positive tests fail (filter returns null); `still skips node_modules` passes.

- [ ] **Step 3: Widen both regexes**

In `src/plugins/server-code-elimination.ts`, change the filter:

```ts
      filter: {
        id: {
          include: [/\.[mc]?[jt]sx?($|\?)/],
          exclude: [/node_modules/],
        },
        code: ANY_PATTERN_RE,
      },
```

And the handler's early return:

```ts
// Only process JS/TS files
if (!/\.[mc]?[jt]sx?($|\?)/.test(id)) {
  return null;
}
```

- [ ] **Step 4: Run the full framework suite**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react`
Expected: all pass.

- [ ] **Step 5: Revert check, then commit and push**

`git stash` (src file only), re-run the test file, expect the three new tests failing, `git stash pop`.

```bash
git add code/frameworks/tanstack-react/src/plugins/server-code-elimination.ts code/frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts
git commit -m "Fix server-code elimination skipping non-tsx ids and Vite query ids"
git push -u origin fix/tanstack-elimination-id-filter
```

---

### Task 2: Strip `.validator()` from client bundles (findings 19 and part of 3)

Branch: `fix/tanstack-strip-validator`

The plugin strips only the deprecated `.inputValidator()`. The current `.validator()` survives, so server-side schema imports leak into the browser bundle, on both `createMiddleware` and `createServerFn` chains.

**Files:**

- Modify: `src/plugins/server-code-elimination.ts`
- Test: `src/plugins/server-code-elimination.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
describe("validator stripping", () => {
  it("strips .validator() from createMiddleware chains", async () => {
    const code = `
import { createMiddleware } from '@tanstack/react-start';
import { serverSchema } from './schemas.server';
export const mw = createMiddleware().validator(serverSchema).server(async ({ next }) => next());
`;
    const result = await transform(code, "/app/src/mw.ts");
    expect(result?.code).not.toContain("validator");
    expect(result?.code).not.toContain("serverSchema");
  });

  it("strips .validator() from createServerFn chains", async () => {
    const code = `
import { createServerFn } from '@tanstack/react-start';
import { serverSchema } from './schemas.server';
export const fn2 = createServerFn().validator(serverSchema).handler(async () => 'ok');
`;
    const result = await transform(code, "/app/src/fn.ts");
    expect(result?.code).not.toContain("validator");
    expect(result?.code).not.toContain("serverSchema");
  });
});
```

Use the file's existing `transform` helper.

- [ ] **Step 2: Run and capture the failures**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts`
Expected: both fail; the emitted code retains `.validator(serverSchema)` and the import.

- [ ] **Step 3: Fix**

In the middleware branch (currently `if (methodName === 'server' || methodName === 'inputValidator')`):

```ts
              if (
                methodName === 'server' ||
                methodName === 'inputValidator' ||
                methodName === 'validator'
              ) {
```

In the `createServerFn` branch of the same visitor (the branch that rewrites `.handler()`), add before the handler rewrite, mirroring the middleware guard style used beside it:

```ts
if (
  resolves(root.rootName, "createServerFn") &&
  (methodName === "validator" || methodName === "inputValidator")
) {
  if (t.isMemberExpression(path.node.callee)) {
    path.replaceWith(path.node.callee.object);
    state.modified = true;
  }
  return;
}
```

The existing dead-code-elimination pass then removes the now-unreferenced `serverSchema` import; if the first test still finds `serverSchema` in the output, the strip ran but DCE did not, which means the replacement left a reference: inspect the emitted code before touching DCE.

- [ ] **Step 4: Full suite, revert check, commit, push**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react`
Expected: all pass. Revert check as in Task 1.

```bash
git add code/frameworks/tanstack-react/src/plugins/server-code-elimination.ts code/frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts
git commit -m "Strip the current .validator() API from client bundles, not only the deprecated .inputValidator()"
git push -u origin fix/tanstack-strip-validator
```

---

### Task 3: Make createIsomorphicFn order-independent (finding 6)

Branch: `fix/tanstack-isomorphic-order`

`.client(a).server(b)` (server outermost) currently replaces the whole chain with a no-op, silently discarding the client implementation. Only `.server().client()` works. The real compiler picks the client implementation regardless of chain order.

**Files:**

- Modify: `src/plugins/server-code-elimination.ts`
- Test: `src/plugins/server-code-elimination.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("keeps the client impl when .server() is outermost", async () => {
  const code = `
import { createIsomorphicFn } from '@tanstack/react-start';
export const f = createIsomorphicFn().client(() => 'CLIENT').server(() => 'SERVER');
`;
  const result = await transform(code, "/app/src/iso.ts");
  expect(result?.code).toContain("CLIENT");
  expect(result?.code).not.toContain("SERVER");
});
```

- [ ] **Step 2: Run and capture the failure**

Expected: fails; the emitted code contains neither string (the chain became a bare no-op spy call).

- [ ] **Step 3: Fix**

Add a helper next to the visitor:

```ts
function findClientImplInChain(node: t.CallExpression): t.Expression | null {
  let current: t.Expression = node;
  while (t.isCallExpression(current) && t.isMemberExpression(current.callee)) {
    const { callee } = current;
    if (
      t.isIdentifier(callee.property) &&
      callee.property.name === "client" &&
      current.arguments[0] &&
      t.isExpression(current.arguments[0])
    ) {
      return current.arguments[0];
    }
    current = callee.object;
  }
  return null;
}
```

In the `createIsomorphicFn` visitor's `server` branch, replace the unconditional no-op with:

```ts
if (methodName === "server") {
  const parent = path.parent;
  if (!t.isMemberExpression(parent) || !t.isCallExpression(path.parentPath?.parent)) {
    const clientImpl = findClientImplInChain(node);
    path.replaceWith(clientImpl ? sbFnCallWithImpl(clientImpl) : sbFnCall());
    state.modified = true;
  }
}
```

- [ ] **Step 4: Full suite, revert check, commit, push**

Expected: all pass, including the two existing `.server().client()`-order tests.

```bash
git add code/frameworks/tanstack-react/src/plugins/server-code-elimination.ts code/frameworks/tanstack-react/src/plugins/server-code-elimination.test.ts
git commit -m "Keep the client implementation of createIsomorphicFn regardless of chain order"
git push -u origin fix/tanstack-isomorphic-order
```

---

### Task 4: Navigate must not use Storybook preview hooks (finding 10)

Branch: `fix/tanstack-navigate-react-effect`

The mocked `Navigate` in `export-mocks/react-router.ts` calls `useEffect` from `storybook/internal/preview-api`, which throws whenever the component mounts outside the initial hooks context (any post-click re-render). The sibling mock in `export-mocks/start.ts` already uses `React.useEffect`.

**Files:**

- Modify: `src/export-mocks/react-router.ts`
- Test: `src/export-mocks/react-router.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/export-mocks/react-router.test.ts`:

```ts
import { renderToString } from "react-dom/server";
import React from "react";
import { Navigate } from "./react-router.ts";

describe("Navigate", () => {
  it("renders outside a storybook hooks context without throwing", () => {
    expect(() => renderToString(React.createElement(Navigate, { to: "/somewhere" }))).not.toThrow();
  });
});
```

(Match the file's existing import style for the module under test.)

- [ ] **Step 2: Run and capture the failure**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react/src/export-mocks/react-router.test.ts`
Expected: fails with the preview-api error `Storybook preview hooks can only be called inside decorators and story functions.`

- [ ] **Step 3: Fix**

In `src/export-mocks/react-router.ts`, change the `Navigate` body to use React's effect:

```ts
export const Navigate: typeof _Navigate = ({ to, href }) => {
  React.useEffect(() => {
    onNavigate({ to: (to as string) || href });
  }, [to, href]);

  return null;
};
```

Then delete `import { useEffect } from 'storybook/internal/preview-api';` if `useEffect` has no other use in the file (verify with a search before deleting).

- [ ] **Step 4: Full suite, typecheck, revert check, commit, push**

```bash
git add code/frameworks/tanstack-react/src/export-mocks/react-router.ts code/frameworks/tanstack-react/src/export-mocks/react-router.test.ts
git commit -m "Use React.useEffect in the Navigate mock so post-render mounts do not throw"
git push -u origin fix/tanstack-navigate-react-effect
```

---

### Task 5: createStart returns a start instance (finding 1)

Branch: `fix/tanstack-create-start-instance`

The mock's `createStart` returns `{}`; the real one returns `{ getOptions, createMiddleware }`. Apps that declare global middleware through the instance crash at module evaluation in every story that imports their `start.ts`.

**Files:**

- Modify: `src/export-mocks/start.ts`
- Test: `src/export-mocks/start.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/export-mocks/start.test.ts`:

```ts
it("createStart returns a start instance", async () => {
  const start = createStart(() => ({ requestMiddleware: [] }));
  expect(typeof start.createMiddleware).toBe("function");
  const middleware = start.createMiddleware({ type: "function" });
  expect(typeof middleware.server).toBe("function");
  await expect(start.getOptions()).resolves.toEqual({ requestMiddleware: [] });
});
```

(Extend the file's existing imports from `./start.ts` with `createStart`.)

- [ ] **Step 2: Run and capture the failure**

Expected: fails with `start.createMiddleware is not a function`.

- [ ] **Step 3: Fix**

In `src/export-mocks/start.ts`, replace `export const createStart = () => ({});` with:

```ts
import { createMiddleware as clientCreateMiddleware } from "@tanstack/start-client-core";

export const createStart = (getOptions?: () => unknown) => ({
  getOptions: async () => (getOptions ? getOptions() : {}),
  createMiddleware: clientCreateMiddleware,
});
```

Place the import with the file's other top imports. `@tanstack/start-client-core` is not intercepted by the module-interception plugin, so this resolves to the real middleware builder, whose chain accumulation is side-effect free in the browser. If the file already imports from `@tanstack/start-client-core`, extend that import instead of adding a second one.

- [ ] **Step 4: Full suite, typecheck, revert check, commit, push**

```bash
git add code/frameworks/tanstack-react/src/export-mocks/start.ts code/frameworks/tanstack-react/src/export-mocks/start.test.ts
git commit -m "Return a real start instance from the createStart mock"
git push -u origin fix/tanstack-create-start-instance
```

---

### Task 6: Remove the dead optimizeDeps export (finding 25)

Branch: `fix/tanstack-optimize-vite-deps`

`preview.tsx` exports a field named `optimizeDeps` that nothing reads: builder-vite consumes the preset-level `optimizeViteDeps` export instead. The devtools packages listed there are never pre-bundled, causing mid-session dep re-optimization reloads.

**Files:**

- Modify: `src/preview.tsx` (delete the export), `src/preset.ts` (extend the real list)
- Test: `src/preset.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `src/preset.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { optimizeViteDeps } from "./preset";

describe("optimizeViteDeps", () => {
  it("pre-bundles the TanStack devtools packages", () => {
    expect(optimizeViteDeps).toEqual(
      expect.arrayContaining([
        "@tanstack/react-devtools",
        "@tanstack/react-query-devtools",
        "@tanstack/react-router-devtools",
      ]),
    );
  });
});
```

- [ ] **Step 2: Run and capture the failure**

Expected: fails; the devtools packages are only in the dead `preview.tsx` list.

- [ ] **Step 3: Fix**

In `src/preset.ts`, append the three package names to the existing `export const optimizeViteDeps = [...]` array. In `src/preview.tsx`, delete the entire `export const optimizeDeps = [...]` block (lines listing the three devtools packages).

- [ ] **Step 4: Full suite, typecheck, revert check, commit, push**

```bash
git add code/frameworks/tanstack-react/src/preset.ts code/frameworks/tanstack-react/src/preset.test.ts code/frameworks/tanstack-react/src/preview.tsx
git commit -m "Move devtools packages to the optimizeViteDeps list builder-vite actually reads"
git push -u origin fix/tanstack-optimize-vite-deps
```

---

### Task 7: Export the override types and allow `__root__` (findings 26 part, 5 of the integration audit)

Branch: `fix/tanstack-override-types`

The runtime supports `routeOverrides: { __root__: {...} }` but the `RouteTreeOverrides` type cannot express it, and neither `RouteTreeOverrides` nor `RouteOverrideOptions` is exported from the package entry, so consumers cannot type an overrides object at all.

**Files:**

- Modify: `src/routing/types.ts`, `src/index.ts`
- Test: `src/routing/duplicate-tree.test.ts` (append a typed usage)

- [ ] **Step 1: Write the failing (compile-level) test**

Append to `src/routing/duplicate-tree.test.ts`:

```ts
import type { RouteTreeOverrides } from "../index.ts";

it("types a __root__ override without casts", () => {
  const overrides: RouteTreeOverrides = {
    __root__: { notFoundComponent: () => null },
  };
  expect(overrides.__root__).toBeDefined();
});
```

- [ ] **Step 2: Capture the failure via typecheck**

Run: `cd /Users/palnes/src/sbfork/code/frameworks/tanstack-react && npx tsc --noEmit -p .`
Expected: errors: `RouteTreeOverrides` is not exported from `../index.ts`, and `__root__` does not exist on the type. (Vitest transpiles without typechecking, so the runtime test alone cannot catch this; the typecheck run is the failing test.)

- [ ] **Step 3: Fix**

In `src/routing/types.ts`, extend the existing mapped type by intersection (keep the mapped part exactly as it is):

```ts
export type RouteTreeOverrides = Partial<{
  [routePath in keyof FileRoutesByPath]: RouteOverrideOptions;
}> & { __root__?: RouteOverrideOptions };
```

(If the current mapped value type is something other than `RouteOverrideOptions`, keep that value type in the mapped part and use `RouteOverrideOptions` only for `__root__` if that matches what `duplicate-tree.ts` accepts for the root; the runtime spreads the same override shape for both, so they should be the same type.)

In `src/index.ts`, add `RouteTreeOverrides` and `RouteOverrideOptions` to the existing `export type {...} from './routing/types.ts'` list.

- [ ] **Step 4: Typecheck, full suite, revert check, commit, push**

Run: typecheck (clean), then the full suite (all pass). Revert check: stash the types change, typecheck must fail again.

```bash
git add code/frameworks/tanstack-react/src/routing/types.ts code/frameworks/tanstack-react/src/index.ts code/frameworks/tanstack-react/src/routing/duplicate-tree.test.ts
git commit -m "Export the route override types and allow a typed __root__ override"
git push -u origin fix/tanstack-override-types
```

---

### Task 8: Warn when path params are missing (finding 14)

Branch: `fix/tanstack-missing-params-warning`

Binding a story to a param route without `parameters.tanstack.router.params` silently produces the literal URL `/users/undefined`. `interpolatePath` reports this through `isMissingParams`, which the decorator discards.

**Files:**

- Modify: `src/routing/decorator.tsx`
- Test: `src/routing/decorator.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/routing/decorator.test.ts`, reusing the file's `fakeContext` helper and mount pattern:

```ts
import { vi } from "vitest";

describe("missing path params", () => {
  it("warns when a param route is mounted without params", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const root = createRootRoute();
    const detail = createRoute({ path: "/users/$userId", getParentRoute: () => root });
    root.addChildren([detail]);

    const router = createStoryRouter({
      Story: () => null,
      context: fakeContext(detail),
    });
    await router.load();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("params"));
    warn.mockRestore();
  });
});
```

- [ ] **Step 2: Run and capture the failure**

Run: `cd /Users/palnes/src/sbfork/code && yarn vitest run frameworks/tanstack-react/src/routing/decorator.test.ts`
Expected: fails; no warning is emitted (and the router's pathname is `/users/undefined`).

- [ ] **Step 3: Fix**

In `src/routing/decorator.tsx`, replace the interpolation statement:

```ts
const interpolated = interpolatePath({
  path: inferredPath,
  params: routerParameters?.params ?? {},
});
if (interpolated.isMissingParams) {
  console.warn(
    `[@storybook/tanstack-react] "${inferredPath}" has path params that were not provided via parameters.tanstack.router.params; the mounted URL will contain the literal string "undefined".`,
  );
}
let resolvedPath = interpolated.interpolatedPath;
```

- [ ] **Step 4: Full suite, revert check, commit, push**

```bash
git add code/frameworks/tanstack-react/src/routing/decorator.tsx code/frameworks/tanstack-react/src/routing/decorator.test.ts
git commit -m "Warn when a story mounts a param route without params"
git push -u origin fix/tanstack-missing-params-warning
```

---

### Task 9: Connect the app's generated route tree (added 2026-08-04)

**Branch:** `feat/tanstack-auto-connect-route-tree`, already written as `feat/auto-connect-route-tree-vite` at `7c2aa2be1af`. This task adopts existing work rather than describing work to do, which is why it has no step list.

A file route carries only its own file path until `routeTree.gen.ts` runs `.update()` over it and supplies the id, path and parent that position it in a tree. An app gets that from its entry module, which Storybook never loads. So the decorator receives routes with no context: they cannot derive a URL and cannot reach the layouts above them.

Every story in this suite works around that today by importing `routeTree` itself and passing `route: routeTree`. The branch makes the framework locate and load the generated tree instead, with a `generatedRouteTree` framework option taking a path or `false`.

It belongs in this phase because it is one self-contained commit that depends on nothing and blocks nothing, which is the phase's whole criterion. It is larger than the other eight, at 312 lines across two preset plugins, but it touches no mock and no routing file.

**Two things it does not inherit from the other eight:**

It changes default behavior, where the others correct behavior that was already wrong. The framework begins loading a file it never loaded. The blast radius is narrow, since code-based and virtual routing find nothing and do nothing, and `generatedRouteTree: false` opts out, but it earns a line in the release note that a bug fix does not.

**It has no instrument, and phase 0 did not measure it.** Nothing in the conformance suite asserts that a file route reaches a story correctly without `route: routeTree`, because every story passes it. Before this ships, the suite should carry a gauge that binds a file route without that parameter: red on `main` and `next`, green on `patched`. That is the phase 0 pattern and it is small, but it does not exist yet, so this task ships unmeasured until it does.

It conflicts with `conformance-build` as of 2026-08-04, having been written before twelve branches that also touch `preset.ts` and `types.ts`. The conflicts are mechanical; composing it is a merge, not a rewrite.

## After all tasks

Build the nine branches into the conformance suite's `patched` channel only when the repository owner asks; the patched tarball currently carries a different fix stack and mixing them is a release decision, not an implementation step. Likewise, upstream PRs for these branches are filed manually by the owner.

## Self-review notes

- Tasks 1-3 all touch `server-code-elimination.ts` on separate branches; upstream may ask to combine them, but as branches they stay independently revertible. Merge conflicts between them are trivial (different visitor branches).
- The `useNavigate`/`Link` seam, cookie semantics, and mock middleware execution are deliberately absent: they change observable story behavior and need the phase 0 instruments plus a design decision (phase 2).
- Finding 27 (docs vs peer ranges) is a docs decision for upstream maintainers, not a code fix; it is left to the PR conversation.
