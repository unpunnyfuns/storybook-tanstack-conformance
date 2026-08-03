# Phase 3: one navigation contract

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** make `Link`, `Navigate`, `useNavigate` and `useRouter().navigate` all record to the same spy always, and all navigate or not navigate together according to one story parameter.

**Architecture:** recording and navigating become two separate switches. Recording is unconditional and additive. Navigating is governed by `parameters.tanstack.router.navigate`, default `false`, carried from the decorator to the mocks through a well-known symbol on `globalThis`, exactly as phase 2 carries `parameters.tanstack.start.context`.

**Tech Stack:** Storybook monorepo (`/Users/palnes/src/sbfork`), Vitest, TypeScript, React. Conformance suite (`/Users/palnes/src/conformance`), Playwright.

**Design document:** [phase 3 design](2026-08-03-phase-3-design.md). Read it before starting; it records why the default is off, and why that break is accepted rather than designed out.

## Global Constraints

- **Two repositories.** Framework work is in `/Users/palnes/src/sbfork`. Gauge stories are in `/Users/palnes/src/conformance`. Each task names its repo. The Bash working directory persists between commands, so start every command with an explicit `cd`.
- **sbfork style:** single quotes, semicolons, match surrounding code exactly. Conformance repo uses double quotes. Do not carry either style into the other.
- **No end-of-line comments. No em dashes in any committed text**, including commit messages.
- **sbfork test command, from the repo ROOT:** `cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react`. Baseline on `upstream/next` is 79 tests in 6 files.
- **sbfork typecheck:** `cd /Users/palnes/src/sbfork/code/frameworks/tanstack-react && npx tsc --noEmit -p .`. Two pre-existing errors in `renderers/react` are baseline noise.
- **A branch that changes the type of anything exported must also pass a real package build**, because `--noEmit` skips declaration emit and cannot see `TS2883`. Run `cd /Users/palnes/src/sbfork/scripts && PATH="/Users/palnes/src/sbfork/node_modules/.bin:$PATH" NODE_ENV=production jiti ./build-package.ts tanstack-react --no-watch --prod`.
- **Adding an export to a file under `export-mocks/` adds public API**, because `plugins/module-interception.ts` redirects real TanStack specifiers to those files. `spies.ts` is the exception: it is not a redirect target. Check `module-interception.ts` before adding any export elsewhere in that directory.
- husky pre-commit fails in this shell. Use `git commit --no-verify` in sbfork.
- **Never push and never open or comment on a pull request or issue.** The repository owner files everything manually.
- Conformance repo gate before any commit there: `cd /Users/palnes/src/conformance && npm run check`.
- TDD with a captured failure: write the test, run it, paste the actual failure output into your report, then fix.
- `onNavigate` accumulates calls across tests in a file. `clearMocks` does not reach a module-scope `fn()` from `storybook/test`. Call `onNavigate.mockClear()` at the top of every test that asserts on it.

## Branches

Each branch is one deliverable and becomes one upstream pull request. All branch off a freshly fetched `upstream/next`.

| Branch                                | Tasks   | Deliverable                                                  |
| ------------------------------------- | ------- | ------------------------------------------------------------ |
| `feat/tanstack-export-navigation-spy` | 1       | The `./spies` subpath, so a story can assert on `onNavigate` |
| `fix/tanstack-navigation-contract`    | 2, 3, 4 | The symbol plumbing, the four mocks, the docs                |
| `fix/tanstack-start-mock-nav-surface` | 5       | Delete `Link` and `Navigate` from the Start mock             |
| conformance `main`                    | 6       | Migrate the affected stories, re-record expectations         |

Task 1 lands first. Tasks 2 to 4 depend on nothing but each other. Task 5 is independent of all of them. Task 6 needs a `patched` build carrying tasks 2 to 4.

## File structure

**sbfork, `code/frameworks/tanstack-react/`:**

| File                                             | Responsibility                                                                                                   | Change |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------ |
| `build-config.ts`                                | Declares the `./spies` build entry. The `exports` map in `package.json` is generated from it, never hand-edited. | Modify |
| `src/story-navigation.ts`                        | Publishes the story's navigate flag through a symbol. One responsibility.                                        | Create |
| `src/story-navigation.test.ts`                   | Tests for the above.                                                                                             | Create |
| `src/routing/types.ts`                           | `RouterParameters` gains `navigate`.                                                                             | Modify |
| `src/routing/decorator.tsx`                      | Calls the publisher for every story.                                                                             | Modify |
| `src/export-mocks/react-router.ts`               | The four navigation paths read the flag and record unconditionally.                                              | Modify |
| `src/export-mocks/react-router.test.ts`          | Tests for the above.                                                                                             | Modify |
| `src/export-mocks/start.ts`                      | Loses its own `Link` and `Navigate`.                                                                             | Modify |
| `docs/get-started/frameworks/tanstack-react.mdx` | Documents the parameter and the breaking change.                                                                 | Modify |

**conformance:** `apps/router/src/navigation.stories.tsx`, `apps/router/src/routes/posts/index.stories.tsx`, `apps/start/src/routes/posts/index.stories.tsx`, `apps/start/src/routes/redirector.stories.tsx`, `expectations.json`.

---

### Task 1: Export the navigation spy

**Repo:** `/Users/palnes/src/sbfork`, branch `feat/tanstack-export-navigation-spy` off `upstream/next`.

`onNavigate` lives in `export-mocks/spies.ts` and is re-exported by nothing, and the package has no `spies` entry in its `exports` map. The docs tell users to assert on it in two places and neither is possible. Nothing else in this phase is worth doing until a story can read the spy.

**Files:**

- Modify: `code/frameworks/tanstack-react/build-config.ts`

**Interfaces:**

- Produces: the subpath `@storybook/tanstack-react/spies`, exporting `onNavigate` and the type `NavigationEvent` from `export-mocks/spies.ts`.

**Do not hand-edit `package.json`.** Its `exports` map is generated from `build-config.ts` by `scripts/build/utils/generate-package-json.ts`, which the build runs. A hand-written entry would be overwritten, and an entry without a matching build entry point would 404 at runtime.

- [ ] **Step 1: Confirm the gap before fixing it**

```bash
cd /Users/palnes/src/sbfork
grep -rn "export const onNavigate" code/frameworks/tanstack-react/src
grep -rn "onNavigate" code/frameworks/tanstack-react/src/export-mocks/react-router.ts code/frameworks/tanstack-react/src/index.ts | grep export
node -p "Object.keys(require('./code/frameworks/tanstack-react/package.json').exports)"
```

Expected: `onNavigate` is declared in `spies.ts` and re-exported nowhere, and the exports map has no `./spies`. Paste all three outputs into your report.

- [ ] **Step 2: Add the build entry**

In `code/frameworks/tanstack-react/build-config.ts`, add to `entries.browser`, in the same shape as the neighbouring entries and keeping the list's existing order:

```ts
      {
        exportEntries: ['./spies'],
        entryPoint: './src/export-mocks/spies.ts',
      },
```

No `external` field. The `./react-router` entry has one because it re-exports `@tanstack/react-router`; `spies.ts` imports only `storybook/test`.

- [ ] **Step 3: Build, and confirm the exports map regenerated itself**

```bash
cd /Users/palnes/src/sbfork/scripts && PATH="/Users/palnes/src/sbfork/node_modules/.bin:$PATH" NODE_ENV=production jiti ./build-package.ts tanstack-react --no-watch --prod
cd /Users/palnes/src/sbfork && node -p "require('./code/frameworks/tanstack-react/package.json').exports['./spies']"
git diff --stat code/frameworks/tanstack-react/package.json
```

Expected: the exports entry now exists and `package.json` shows as modified without you having edited it. If it did not regenerate, the build entry in Step 2 is wrong; fix that rather than writing the entry by hand.

- [ ] **Step 4: Prove the subpath resolves to the spy**

```bash
cd /Users/palnes/src/sbfork
ls code/frameworks/tanstack-react/dist/export-mocks/spies.js code/frameworks/tanstack-react/dist/export-mocks/spies.d.ts
node -e "import('./code/frameworks/tanstack-react/dist/export-mocks/spies.js').then((m) => console.log(Object.keys(m)))"
```

Expected: both files exist, and the module exports `onNavigate`. A built file that exists but exports nothing means the entry point path is wrong.

- [ ] **Step 5: Full suite, typecheck, commit**

```bash
cd /Users/palnes/src/sbfork
npx vitest run code/frameworks/tanstack-react
cd code/frameworks/tanstack-react && npx tsc --noEmit -p .
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/build-config.ts code/frameworks/tanstack-react/package.json
git commit --no-verify -m "TanStack: Export the navigation spy so stories can assert on it"
```

Expected: 79 tests pass, unchanged. This task adds no tests because it adds no behavior; the build output in Step 4 is its evidence. Stage the generated `package.json` alongside the config, since the two must not drift.

---

### Task 2: Carry the navigate flag from the story to the mocks

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-navigation-contract` off `upstream/next`.

**Files:**

- Create: `code/frameworks/tanstack-react/src/story-navigation.ts`
- Create: `code/frameworks/tanstack-react/src/story-navigation.test.ts`
- Modify: `code/frameworks/tanstack-react/src/routing/types.ts`
- Modify: `code/frameworks/tanstack-react/src/routing/decorator.tsx`

**Interfaces:**

- Produces: `setStoryNavigation(enabled: boolean | undefined): void`, and the symbol key `'storybook.tanstack-react.story-navigation'` which Task 3 reads by declaring its own `Symbol.for` with the same string.

- [ ] **Step 1: Write the failing test**

Create `code/frameworks/tanstack-react/src/story-navigation.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";

import { setStoryNavigation } from "./story-navigation.ts";

const NAVIGATION_SYMBOL = Symbol.for("storybook.tanstack-react.story-navigation");

const globals = globalThis as typeof globalThis & { [NAVIGATION_SYMBOL]?: boolean };

afterEach(() => {
  delete globals[NAVIGATION_SYMBOL];
});

describe("setStoryNavigation", () => {
  it("publishes the flag a story enabled", () => {
    setStoryNavigation(true);
    expect(globals[NAVIGATION_SYMBOL]).toBe(true);
  });

  it("clears the flag when a story declares none, so it cannot leak into the next", () => {
    setStoryNavigation(true);
    setStoryNavigation(undefined);
    expect(NAVIGATION_SYMBOL in globals).toBe(false);
  });

  it("clears the flag when a story explicitly disables it", () => {
    setStoryNavigation(true);
    setStoryNavigation(false);
    expect(globals[NAVIGATION_SYMBOL]).toBe(false);
  });
});
```

- [ ] **Step 2: Run and capture the failure**

```bash
cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react/src/story-navigation.test.ts
```

Expected: fails to resolve `./story-navigation.ts`. Paste the output.

- [ ] **Step 3: Write the publisher**

Create `code/frameworks/tanstack-react/src/story-navigation.ts`.

There is a sibling that solves this exact shape for a different value, `story-start-context.ts`, but **it does not exist on this branch**. It was added by phase 2 and lives on `fix/tanstack-server-fn-delegation`, which has not landed upstream. This branch is off `upstream/next`, so write the file standalone from the code below rather than looking for a neighbour to copy.

To read the sibling for reference without switching branches:

```bash
cd /Users/palnes/src/sbfork
git show fix/tanstack-server-fn-delegation:code/frameworks/tanstack-react/src/story-start-context.ts
```

Both files will exist once the branches are composed, and they should read as a pair. That composition happens on `conformance-build` and is not this task's problem.

```ts
/**
 * Whether the current story performs navigation or only records it.
 *
 * This deliberately does not live under `export-mocks/`. Files there are the
 * redirect targets of `plugins/module-interception.ts`, so anything exported
 * from them is importable under a real TanStack specifier and becomes API no
 * real app has. The value crosses module boundaries through a well-known
 * symbol on `globalThis`, and the reader declares its own `Symbol.for` with
 * the same key rather than importing this.
 */
const STORY_NAVIGATION_SYMBOL = Symbol.for("storybook.tanstack-react.story-navigation");

type BrowserNavigationGlobals = typeof globalThis & {
  [STORY_NAVIGATION_SYMBOL]?: boolean;
};

const browserGlobals = globalThis as BrowserNavigationGlobals;

/**
 * Publishes the current story's navigate flag, or clears it when the story
 * declares none. The decorator calls this for every story, because Storybook
 * keeps preview modules alive across navigations and one story's setting must
 * not survive into the next.
 */
export function setStoryNavigation(enabled: boolean | undefined) {
  if (enabled === undefined) {
    delete browserGlobals[STORY_NAVIGATION_SYMBOL];
    return;
  }

  browserGlobals[STORY_NAVIGATION_SYMBOL] = enabled;
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react/src/story-navigation.test.ts
```

Expected: 3 pass.

- [ ] **Step 5: Add the story parameter**

In `code/frameworks/tanstack-react/src/routing/types.ts`, add to `RouterParameters`, beside the existing `context` field:

```ts
  /**
   * Whether navigation actually happens in this story, or is only recorded on
   * the `onNavigate` spy.
   *
   * Off by default, and off applies to every path: `Link`, `Navigate`,
   * `useNavigate` and `useRouter().navigate` all record and leave the story on
   * screen. On, all four navigate for real and still record.
   *
   * Turn it on for a story that asserts on where navigation lands. Note that
   * navigating to a route outside the mounted tree renders a not found, the
   * same as it would in the app.
   */
  navigate?: boolean;
```

- [ ] **Step 6: Publish it from the decorator**

In `code/frameworks/tanstack-react/src/routing/decorator.tsx`, make `tanstackRouteDecorator` publish the flag before it renders:

```ts
export const tanstackRouteDecorator: Decorator = (Story, context) => {
  // Set on every story, including back to undefined, so one story's setting
  // cannot leak into the next: Storybook keeps preview modules alive across
  // navigations.
  setStoryNavigation(context.parameters.tanstack?.router?.navigate);

  return <TanStackRouterStory Story={Story} context={context} />;
};
```

On this branch that is the only such call, so it carries its own comment. Phase 2 adds a `setStoryStartContext` call in the same place on a different branch, with the same comment for the same reason; when the two are composed they sit together and one comment covers both. Do not try to anticipate that here.

- [ ] **Step 7: Full suite, typecheck, build, format, commit**

```bash
cd /Users/palnes/src/sbfork
npx vitest run code/frameworks/tanstack-react
cd code/frameworks/tanstack-react && npx tsc --noEmit -p .
cd /Users/palnes/src/sbfork/scripts && PATH="/Users/palnes/src/sbfork/node_modules/.bin:$PATH" NODE_ENV=production jiti ./build-package.ts tanstack-react --no-watch --prod
cd /Users/palnes/src/sbfork
git add code/frameworks/tanstack-react/src/
git commit --no-verify -m "TanStack: Carry a story's navigate flag to the router mocks"
```

Expected: 82 tests pass. The build must succeed because `RouterParameters` is an exported type.

---

### Task 3: Record unconditionally, navigate only when asked

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-navigation-contract` (continues from Task 2).

This is the core of the phase. All four navigation paths gain the same two properties.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/react-router.ts`
- Test: `code/frameworks/tanstack-react/src/export-mocks/react-router.test.ts`

**Interfaces:**

- Consumes: the symbol key `'storybook.tanstack-react.story-navigation'` from Task 2, read by declaring a local `Symbol.for` with the same string. Do not import from `story-navigation.ts`; that file is the writer.

- [ ] **Step 1: Write the failing tests**

`react-router.test.ts` already exists and already uses a DOM environment. Read its header before adding to it and follow whatever environment and setup it establishes.

```ts
describe("navigation contract", () => {
  beforeEach(() => {
    onNavigate.mockClear();
    setStoryNavigation(undefined);
  });

  it("records a useNavigate call without navigating by default", async () => {
    const navigate = renderHookInRouter(() => useNavigate());
    await navigate({ to: "/nav-target" });

    expect(onNavigate).toHaveBeenCalledWith({ to: "/nav-target" });
    expect(currentPath()).toBe("/");
  });

  it("navigates and records when the story enables navigation", async () => {
    setStoryNavigation(true);
    const navigate = renderHookInRouter(() => useNavigate());
    await navigate({ to: "/nav-target" });

    expect(onNavigate).toHaveBeenCalledWith({ to: "/nav-target" });
    expect(currentPath()).toBe("/nav-target");
  });

  it("records a router.navigate call without navigating by default", async () => {
    const router = renderHookInRouter(() => useRouter());
    await router.navigate({ to: "/nav-target" });

    expect(onNavigate).toHaveBeenCalledWith({ to: "/nav-target" });
    expect(currentPath()).toBe("/");
  });

  it("leaves the rest of the router untouched", () => {
    const router = renderHookInRouter(() => useRouter());
    expect(typeof router.buildLocation).toBe("function");
    expect(router.state).toBeDefined();
  });
});
```

`renderHookInRouter` and `currentPath` do not exist yet. Write them as local helpers in this test file: `renderHookInRouter` renders a probe component inside a real router built over a two route tree (`/` and `/nav-target`) using the same `createRouter` and `RouterProvider` the decorator uses, and returns whatever the callback returned; `currentPath` reads `router.state.location.pathname` from that same router. Model the router construction on `routing/decorator.tsx`'s `createStoryRouter`, but keep it minimal: this test needs two routes, not a tree builder.

- [ ] **Step 2: Run and capture the failures**

```bash
cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react/src/export-mocks/react-router.test.ts
```

Expected: the recording assertions fail because `useNavigate` and `useRouter` record nothing today, and the first and third tests also fail on `currentPath()` because both navigate today. Paste all of it.

- [ ] **Step 3: Add the flag reader**

At the top of `react-router.ts`, beside the existing imports:

```ts
const STORY_NAVIGATION_SYMBOL = Symbol.for("storybook.tanstack-react.story-navigation");

/**
 * Whether this story performs navigation or only records it. Written by the
 * decorator through `story-navigation.ts`; read here through the same symbol
 * rather than an import, because a file under `export-mocks/` must not gain
 * exports and must not depend on one that could.
 */
function navigationEnabled() {
  return (globalThis as Record<symbol, unknown>)[STORY_NAVIGATION_SYMBOL] === true;
}
```

- [ ] **Step 4: Wrap `useNavigate`**

Replace the existing one-line export. The hook must still be a spy, because `apps/router/src/routes/posts/index.stories.tsx` asserts `expect(useNavigate).toHaveBeenCalled()` and `expect(interceptedUseNavigate).toBe(useNavigate)`.

```ts
export const useNavigate = fn(((opts?: Parameters<typeof _useNavigate>[0]) => {
  const navigate = _useNavigate(opts);

  return (options: Parameters<ReturnType<typeof _useNavigate>>[0]) => {
    onNavigate({ to: options?.to as string | undefined });
    return navigationEnabled() ? navigate(options) : Promise.resolve();
  };
}) as typeof _useNavigate).mockName("@tanstack/react-router::useNavigate");
```

`_useNavigate` is called during render, so hook rules hold. The returned function is what defers.

- [ ] **Step 5: Wrap `useRouter`**

Only `navigate` is intercepted. Everything else passes through, which the fourth test asserts.

```ts
export const useRouter = fn((() => {
  const router = _useRouter();

  return new Proxy(router, {
    get(target, property, receiver) {
      if (property !== "navigate") {
        return Reflect.get(target, property, receiver);
      }

      return (options: Parameters<typeof target.navigate>[0]) => {
        onNavigate({ to: options?.to as string | undefined });
        return navigationEnabled() ? target.navigate(options) : Promise.resolve();
      };
    },
  });
}) as typeof _useRouter).mockName("@tanstack/react-router::useRouter");
```

**Verify rather than assume that the proxy is safe.** Router methods may rely on `this`, and `Reflect.get` with `receiver` set to the proxy can rebind it. If any existing test breaks, or `router.buildLocation` throws, bind the passthrough to `target` instead of using `receiver` and say so in your report.

- [ ] **Step 6: Make `Link` and `Navigate` honour the flag**

**Read `Link` and `Navigate` on this branch before touching them.** An earlier draft of this step described the versions on the `patched` channel, which carry work from `fix/tanstack-react-link-href` (PR #35505) and `fix/tanstack-navigate-react-effect` that has not landed upstream. On `upstream/next`, `Link` is a bare anchor with `href: to` and no `useLinkProps`, and `Navigate` has no de-duplication ref.

`Link` calls `preventDefault()` unconditionally today. Keep that unconditional. The anchor's `href` is a route path, so letting the browser follow it would trigger a full page load out of the Storybook iframe rather than a client-side route change. Navigate through the router instead, which is also what real TanStack `Link` does with a click:

```ts
      onClick: (e: React.MouseEvent) => {
        onNavigate({ to, from: location.href });

        if (!navigationEnabled()) {
          e.preventDefault();
          return;
        }

        (_navigate as ((event: React.MouseEvent) => void) | undefined)?.(e);
      },
```

`Navigate` keeps its effect and its de-duplication ref exactly as they are, and gains a real render when navigation is on:

```ts
return navigationEnabled() ? React.createElement(_Navigate, { to, href } as never) : null;
```

- [ ] **Step 7: Run the tests**

```bash
cd /Users/palnes/src/sbfork && npx vitest run code/frameworks/tanstack-react
```

Expected: all pass. Existing tests asserting that `Link` blocks must still pass, because the default is off.

- [ ] **Step 8: Revert check, typecheck, build, format, commit**

Revert only `react-router.ts`, keep the tests, and confirm exactly the new tests fail:

```bash
cd /Users/palnes/src/sbfork
git checkout HEAD -- code/frameworks/tanstack-react/src/export-mocks/react-router.ts
npx vitest run code/frameworks/tanstack-react
```

Then restore your work, and:

```bash
cd /Users/palnes/src/sbfork
cd code/frameworks/tanstack-react && npx tsc --noEmit -p .
cd /Users/palnes/src/sbfork && git add code/frameworks/tanstack-react/src/
git commit --no-verify -m "TanStack: Record every navigation, and navigate only when the story asks"
```

Use `git checkout HEAD --`, not `git checkout --`. The latter restores from the index, which may hold your staged work, and the check would prove nothing.

---

### Task 4: Document the parameter and the break

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-navigation-contract` (continues from Task 3).

**Files:**

- Modify: `code/frameworks/tanstack-react/docs/get-started/frameworks/tanstack-react.mdx`

- [ ] **Step 1: Correct the two claims that stop being true**

Find these lines and read their full paragraphs first:

```bash
cd /Users/palnes/src/sbfork
grep -n "navigation hooks work in stories\|available in stories, and wires navigation" docs/get-started/frameworks/tanstack-react.mdx
```

Both say navigation hooks work in stories. After Task 3 they record but do not navigate unless the story opts in. Rewrite both to say what is now true, naming the parameter.

- [ ] **Step 2: Document the parameter**

Add `navigate` to the router parameters section, wherever `routeOverrides` and `context` are already listed, in the same register. It must say: off by default; on makes `Link`, `Navigate`, `useNavigate` and `useRouter().navigate` all navigate for real; all four record on the spy either way; and navigating outside the mounted tree renders a not found the same as the app would.

- [ ] **Step 3: Add the breaking-change callout**

**There is no existing breaking-changes callout on this branch.** Phase 2 adds one, on `fix/tanstack-server-fn-delegation`, and it is not here. Put the callout next to the behavior it describes, in the mocking section, and leave `MIGRATION.md` alone: its only TanStack section is the react-vite migration guide, and choosing a version heading is a release decision.

Say that `useNavigate` and `useRouter().navigate` no longer navigate by default, that a story asserting on a destination must set `parameters.tanstack.router.navigate: true`, and that both now record on `onNavigate` where they previously recorded nothing.

- [ ] **Step 4: Document the spy import**

Task 1 added the `@storybook/tanstack-react/spies` subpath, on its own branch, so it does not exist here. Document it anyway; it ships in the same release.

**On this branch there is exactly one place** telling users to assert on the navigation spy, in the section describing the mock modules, and it does not say where to import it from because until this phase there was nowhere. Name the subpath there. An earlier draft of this step said there were two; the second is in a `useServerFn` paragraph that phase 2 adds on a different branch, and nothing in `docs/` on this branch mentions `useServerFn` at all.

- [ ] **Step 5: Docs check, commit**

```bash
cd /Users/palnes/src/sbfork
node_modules/.bin/jiti scripts/docs/check-docs.ts
git add docs/get-started/frameworks/tanstack-react.mdx
git commit --no-verify -m "TanStack: Document the navigate parameter and what it changes"
```

No em dashes. If the docs check command differs in this tree, find how it is invoked from `scripts/package.json` and use that.

---

### Task 5: Delete the Start mock's own Link and Navigate

**Repo:** `/Users/palnes/src/sbfork`, branch `fix/tanstack-start-mock-nav-surface` off `upstream/next`. Independent of Tasks 2 to 4.

The real `@tanstack/react-start` exports only `useServerFn` plus `export * from "@tanstack/start-client-core"`. It exports no `Link` and no `Navigate`, so the copies in `start.ts` are surface no real app can import. They are also the pre-phase-1 versions: no `href` fallback and no de-duplication ref, so they fire twice under StrictMode.

**Files:**

- Modify: `code/frameworks/tanstack-react/src/export-mocks/start.ts`

- [ ] **Step 1: Confirm the real package's surface**

```bash
cd /Users/palnes/src/sbfork
cat node_modules/@tanstack/react-start/dist/esm/index.js
grep -n "export const Link\|export const Navigate" code/frameworks/tanstack-react/src/export-mocks/start.ts
```

Expected: the real entry exports `useServerFn` and star-exports `start-client-core`, and `start.ts` declares both components. Paste both. If the real package does export either, stop and report it; the premise of this task is wrong.

- [ ] **Step 2: Delete both, and any import only they used**

Remove the `Link` and `Navigate` declarations from `start.ts`. Check whether `onNavigate` or `React` are still used elsewhere in the file before removing either import.

- [ ] **Step 3: Run the suite and typecheck**

```bash
cd /Users/palnes/src/sbfork
npx vitest run code/frameworks/tanstack-react
cd code/frameworks/tanstack-react && npx tsc --noEmit -p .
```

Expected: all pass. If a test imported `Link` or `Navigate` from `start.ts`, it was asserting on surface the real package does not have; delete that test and say so in your report rather than keeping it alive.

- [ ] **Step 4: Build and commit**

```bash
cd /Users/palnes/src/sbfork/scripts && PATH="/Users/palnes/src/sbfork/node_modules/.bin:$PATH" NODE_ENV=production jiti ./build-package.ts tanstack-react --no-watch --prod
cd /Users/palnes/src/sbfork && git add code/frameworks/tanstack-react/src/export-mocks/start.ts
git commit --no-verify -m "TanStack: Stop exporting Link and Navigate the real Start package does not have"
```

---

### Task 6: Migrate the affected stories and re-record

**Repo:** `/Users/palnes/src/conformance` (branch `main`). Needs a `patched` build carrying Tasks 2 to 4.

Three stories rely on imperative navigation actually happening. They are the migration every affected user will perform, so the diff is documentation.

**Files:**

- Modify: `apps/router/src/navigation.stories.tsx`
- Modify: `apps/router/src/routes/posts/index.stories.tsx`
- Modify: `apps/start/src/routes/posts/index.stories.tsx`
- Modify: `apps/start/src/routes/redirector.stories.tsx`
- Modify: `expectations.json` (via script only, never by hand)

- [ ] **Step 1: Set the parameter on the stories that navigate**

In `apps/router/src/navigation.stories.tsx`, add `navigate: true` to the `tanstack.router` parameters in the file's `meta`, so all four navigation gauges assert what the real app does. Extend the file's existing block comment to say why, in its register: these gauges assert the real app's navigation, so they opt in.

In `apps/router/src/routes/posts/index.stories.tsx` and `apps/start/src/routes/posts/index.stories.tsx`, add `navigate: true` to the `Pagination` story only, not the file's meta. The other stories in those files do not navigate and should keep the safe default. Add a one-line comment saying the story asserts on the page changing, which needs real navigation.

In `apps/start/src/routes/redirector.stories.tsx`, add `navigate: true` to the meta. Its route redirects to itself with a search flag and reads it back, so it only turns green if navigation happens.

- [ ] **Step 2: Prove the migration is necessary, not decorative**

Run one migrated story against the patched build with the parameter removed, and confirm it fails:

```bash
cd /Users/palnes/src/conformance && npm run test --workspace=apps/router
```

Expected with `navigate: true` removed from `Pagination`: it fails on `Page 2` never appearing. Restore the parameter and confirm it passes. Paste both.

- [ ] **Step 3: Re-record all three channels**

Follow the channel procedure exactly. For each of `main`, `next`, `patched`:

```bash
cd /Users/palnes/src/conformance
node scripts/channel.mjs <channel>
rm -rf node_modules package-lock.json
find apps -maxdepth 2 -name node_modules -type d -exec rm -rf {} +
npm install --prefer-online
npm ls @storybook/tanstack-react
node scripts/conformance-report.mjs
node scripts/verify.mjs <channel> --update
```

The `npm ls` check is not optional: a stale install leaves the framework nested per app while the root stays on the old channel, and the run measures the wrong thing.

On `main` and `next` the `navigate` parameter is unknown to the published framework and is ignored, so those channels should show no change beyond noise. On `patched`, `By Link`, `By Component` and `Redirect Navigates` go green. Report all three diffs.

- [ ] **Step 4: Restore the main channel, regenerate docs, gate, commit**

```bash
cd /Users/palnes/src/conformance
git checkout -- apps/router/package.json apps/router-code/package.json apps/router-csf4/package.json apps/router-shell/package.json apps/router-virtual/package.json apps/start/package.json apps/start-virtual/package.json package-lock.json
rm -rf node_modules
find apps -maxdepth 2 -name node_modules -type d -exec rm -rf {} +
npm install
node scripts/docs.mjs
npm run format
npm run check
git add -A
git commit -m "test: opt the navigating stories into real navigation"
```

Restore the seven app manifests individually. `git checkout -- apps` would also revert the story changes this task exists to make.

---

## Self-review notes

- Task 1 must land before anything in this suite can assert on `onNavigate`, but nothing in this plan does. The conformance stories assert on rendered output, not the spy, precisely so they keep working on channels whose framework has no `./spies` subpath.
- Tasks 2 to 4 share a branch and must run in order. Task 5 shares nothing and can run at any point.
- Task 6 cannot start until a `patched` tarball carries Tasks 2 to 4. Building that tarball is a release step, not part of this plan.
- The two `Pagination` stories are the only places in the suite where the breaking change bites. If a fourth turns up during Task 6, that is worth reporting: it means the audit undercounted the blast radius.
- The design mentions a codemod as a migration aid. It is deliberately not a task here. It cannot be a behavior-preserving transform, because the switch is symmetric and a story using both a `Link` and `useNavigate` cannot be migrated by setting one flag. Shipping it belongs with the release, not with the change.
- Task 1 was written twice. The first version hand-edited the `exports` map in `package.json`, which is generated from `build-config.ts` by the build and would have been overwritten. If any later task needs a new subpath, edit the config and let the build write the manifest.
