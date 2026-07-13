# storybook-tanstack-repro

Story-level coverage of `@storybook/tanstack-react` against a real TanStack
Router application, in both file-based and code-based (config) setups. Every
scenario is a story with a play function asserting on rendered output;
`npm test` runs the whole suite in a headless browser, so a framework
regression shows up as red tests, not as a vague "stories look broken".

The app itself (`npm run dev`) is the control: every route works in the
browser, and each page describes its own expected behavior in the UI. Anything
red in the story suite is a framework issue, not an app issue.

## What is tested

### File-based routes (generated tree)

| Story file                                       | Scenario                                                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `src/routes/index.stories.tsx`                   | Root index route; `validateSearch` + `query` banner variant                                                           |
| `src/routes/about.stories.tsx`                   | Flat route bound via `route` + `path`                                                                                 |
| `src/routes/(marketing)/pricing.stories.tsx`     | Route in a `(group)` directory, served at its group-free URL                                                          |
| `src/routes/users/index.stories.tsx`             | Route nested under a pathful layout                                                                                   |
| `src/routes/users/$userId.stories.tsx`           | Path param + loader (`params` interpolation); `notFound()` variant                                                    |
| `src/routes/posts/index.stories.tsx`             | `validateSearch` + `query` (filters, pagination, sort)                                                                |
| `src/routes/posts/$postId/index.stories.tsx`     | Nested layout under a param; `params` and `query` together                                                            |
| `src/routes/posts/_archive/archived.stories.tsx` | Leaf under a **nested pathless layout** (`/posts/_archive`), strict-mode `Route.useLoaderData()`                      |
| `src/routes/files/$.stories.tsx`                 | Splat route; `params: { _splat }` interpolation                                                                       |
| `src/routes/boom.stories.tsx`                    | Loader throws; error boundary renders                                                                                 |
| `src/routes/_authed/dashboard.stories.tsx`       | Route under a **pathless layout** at its real URL; `routeOverrides` disabling the guard; router `context`             |
| `src/routes/_authed/route.stories.tsx`           | Story bound **directly to a pathless layout route** ([#34942](https://github.com/storybookjs/storybook/issues/34942)) |
| `src/tree-mode.stories.tsx`                      | Tree mode with the generated tree: story component injected at the leaf selected by `path` (+ `params`)               |

### Code-based routes (`createRoute` config tree)

| Story file                                  | Scenario                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/code-based/code-based.stories.tsx`     | Story bound to a single `createRoute()`; loader list, and a param route + search validation under an **id-only pathless layout** |
| `src/code-based/code-tree-mode.stories.tsx` | Tree mode with the code-based tree: leaf selected by `path` + `params`                                                           |

21 stories across 15 files. All stories render real route components (or, in
tree mode, inject a probe component at a real leaf) through
`parameters.tanstack.router`: `route`, `path`, `params`, `query`,
`routeOverrides`, `context`.

## Run it

```bash
npm install
npx playwright install chromium   # once, for the story test runner
npm test                          # every story's play function, headless
npm run storybook                 # browse the stories interactively on :6006
npm run dev                       # the app, working, for comparison
```

## Branches

| Branch    | Framework                             |
| --------- | ------------------------------------- |
| `main`    | stock `storybook@10.5.0`              |
| `next`    | stock `storybook@next` (latest alpha) |
| `patched` | `main` + `patch-package` dist patches |

`main` and `next` stay stock so results always reflect released framework
behavior. `patched` carries whatever candidate fixes are being validated at
the time as `patch-package` dist patches; its contents change as fixes land
upstream and new ones appear.

## Current results

On stock `storybook@10.5.0` and the current `next` alpha, **all 21 stories
fail** during story-router construction, with two distinct crashes:

- File-based tree: `Invariant failed: Duplicate routes found with id: /` —
  the pathless `/_authed` id is normalized to `path: '/'` and collides with
  the real index route. Every story in the project dies, including ones that
  touch nothing pathless.
- Code-based tree: `Invariant failed: Duplicate routes found with id: __root__`
  — tree duplication strips the explicit id from an id-only layout route.

Fixes in flight:
[storybookjs/storybook#35465](https://github.com/storybookjs/storybook/pull/35465)
and stacked follow-ups (leaf resolution and composed-id preservation, opt-in
navigation). With those applied, all 21 stories pass; the `patched` branch
currently demonstrates that. Upstream history:
[#34942](https://github.com/storybookjs/storybook/issues/34942),
[#34946](https://github.com/storybookjs/storybook/issues/34946),
[#34950](https://github.com/storybookjs/storybook/pull/34950),
[#35007](https://github.com/storybookjs/storybook/issues/35007).

## App structure

| Feature                                                             | File                                  |
| ------------------------------------------------------------------- | ------------------------------------- |
| Root layout, nav, error + notFound boundaries, `RouterContext` type | `src/routes/__root.tsx`               |
| Home / feature index + `validateSearch` for `redirectedFrom`        | `src/routes/index.tsx`                |
| Flat route                                                          | `src/routes/about.tsx`                |
| Group directory route (URL-invisible segment)                       | `src/routes/(marketing)/pricing.tsx`  |
| Layout route + nested `<Outlet>`                                    | `src/routes/users/route.tsx`          |
| Dynamic path param + loader + `notFound()`                          | `src/routes/users/$userId.tsx`        |
| Search-param validation, filters, pagination                        | `src/routes/posts/index.tsx`          |
| Nested layout under a param                                         | `src/routes/posts/$postId/route.tsx`  |
| Nested pathless layout under a pathful segment                      | `src/routes/posts/_archive/route.tsx` |
| Splat route                                                         | `src/routes/files/$.tsx`              |
| Loader that throws (error boundary)                                 | `src/routes/boom.tsx`                 |
| Pathless layout + `beforeLoad` guard + `redirect`                   | `src/routes/_authed/route.tsx`        |
| Route context consumer                                              | `src/routes/_authed/dashboard.tsx`    |
| Standalone code-based tree (id-only layout, loader, param + search) | `src/code-based/tree.tsx`             |

`src/routeTree.gen.ts` is generated by `@tanstack/router-plugin`; it is
gitignored and regenerates on `npm run dev` / `npm test`.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the repro is maintained and verified by a human.
