# storybook-tanstack-repro

Story-level coverage of `@storybook/tanstack-react` against a real TanStack
Router application. Every route in the app has a colocated story that renders
the **real route component** through `parameters.tanstack.router`, and every
story has a play function asserting on the rendered output. `npm test` runs
the whole suite in a headless browser, so a framework regression shows up as
red tests, not as a vague "stories look broken".

## What is tested

| Story file                                   | Framework feature under test                                                                                                                 | Assertion                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `src/routes/about.stories.tsx`               | Flat route bound via `route` + `path`                                                                                                        | Page heading renders                             |
| `src/routes/users/index.stories.tsx`         | Route nested under a pathful layout (`users/route.tsx`)                                                                                      | Loader-backed list renders                       |
| `src/routes/users/$userId.stories.tsx`       | Path param + loader, `params: { userId: '1' }` interpolation                                                                                 | Loader data for the param renders                |
| `src/routes/posts/index.stories.tsx`         | `validateSearch` + `query` parameters (filters, pagination, sort)                                                                            | Unfiltered heading; filtered match count         |
| `src/routes/posts/$postId/index.stories.tsx` | Nested layout under a param; `params` and `query` together                                                                                   | Loader data renders; search param drives styling |
| `src/routes/_authed/dashboard.stories.tsx`   | Route under a **pathless layout** at its real URL `/dashboard`; `routeOverrides` disabling the layout's `beforeLoad` guard; router `context` | Page renders; context value visible              |
| `src/routes/_authed/route.stories.tsx`       | Story bound **directly to a pathless layout route** ([#34942](https://github.com/storybookjs/storybook/issues/34942))                        | Layout mounts without the not-found fallback     |

The app itself (`npm run dev`) is the control: every route works in the
browser, and each page describes its own expected behavior in the UI. Anything
red in the story suite is therefore a framework issue, not an app issue.

## Run it

```bash
npm install
npx playwright install chromium   # once, for the story test runner
npm test                          # every story's play function, headless
npm run storybook                 # browse the stories interactively on :6006
npm run dev                       # the app, working, for comparison
```

## Branches

| Branch    | Framework                                          | Result           |
| --------- | -------------------------------------------------- | ---------------- |
| `main`    | stock `storybook@10.5.0`                           | 9/9 stories fail |
| `next`    | stock `storybook@next` (latest alpha)              | 9/9 stories fail |
| `patched` | `10.5.0` + `patch-package` dist built from the fix | 9/9 stories pass |

## Current failure on stock Storybook

On `storybook@10.5.0` and the current `next` alpha, every story fails during
router construction:

```
Invariant failed: Duplicate routes found with id: /
```

The framework normalizes the pathless id `/_authed` to `path: '/'`, which
collides with the app's real index route when the route tree is duplicated for
the story router. Because the crash happens before anything renders, even the
plain `/about` story dies. Fix in flight:
[storybookjs/storybook#35465](https://github.com/storybookjs/storybook/pull/35465)
(plus stacked follow-ups for leaf resolution and opt-in navigation); the
`patched` branch applies its built output over the stock `dist/` and turns the
suite green. Upstream history:
[#34942](https://github.com/storybookjs/storybook/issues/34942),
[#34946](https://github.com/storybookjs/storybook/issues/34946),
[#34950](https://github.com/storybookjs/storybook/pull/34950),
[#35007](https://github.com/storybookjs/storybook/issues/35007).

## App structure

| Feature                                                             | File                                 |
| ------------------------------------------------------------------- | ------------------------------------ |
| Root layout, nav, error + notFound boundaries, `RouterContext` type | `src/routes/__root.tsx`              |
| Home / feature index + `validateSearch` for `redirectedFrom`        | `src/routes/index.tsx`               |
| Flat route                                                          | `src/routes/about.tsx`               |
| Layout route + nested `<Outlet>`                                    | `src/routes/users/route.tsx`         |
| Dynamic path param + loader + `notFound()`                          | `src/routes/users/$userId.tsx`       |
| Search-param validation, filters, pagination                        | `src/routes/posts/index.tsx`         |
| Nested layout under a param                                         | `src/routes/posts/$postId/route.tsx` |
| Pathless layout + `beforeLoad` guard + `redirect`                   | `src/routes/_authed/route.tsx`       |
| Route context consumer                                              | `src/routes/_authed/dashboard.tsx`   |

`src/routeTree.gen.ts` is generated by `@tanstack/router-plugin`; it is
gitignored and regenerates on `npm run dev` / `npm test`.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the repro is maintained and verified by a human.
