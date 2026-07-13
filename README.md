# storybook-tanstack-repro

Reproduction for `@storybook/tanstack-react` breaking on route trees that contain
pathless layout routes. Companion to
[storybookjs/storybook#35465](https://github.com/storybookjs/storybook/pull/35465).

A minimal Vite + React + TypeScript SPA using TanStack Router file-based routing,
with stories colocated next to the routes they render. The app itself works
(`npm run dev`); the stories fail.

## The bug

On `storybook@10.5.0`, any app route tree containing a pathless segment
(`_authed/`, `(group)/`) crashes **every story** in the project:

```
Invariant failed: Duplicate routes found with id: /
```

The framework's `createFileRoute` mock normalizes the pathless id `/_authed` to
`path: '/'`, which collides with the app's real index route when the route tree
is duplicated for the story router. The crash happens in `createStoryRouter`
before any story renders, so even a story for a plain flat route (`/about`) dies.

On `10.4.6` the same id was normalized to the literal path `/_authed` instead:
stories did not crash, but routes under a pathless layout were only reachable
through non-URL workaround paths (`path: '/_authed/dashboard'` instead of the
real `/dashboard`), and a story bound directly to the layout route could not
render. The `10.5.0` normalization change
([#34948](https://github.com/storybookjs/storybook/pull/34948), for
[#34942](https://github.com/storybookjs/storybook/issues/34942)) removed the
workaround without fixing the underlying matching, so the failure escalated
from "wrong URLs" to "nothing renders".

Related upstream history: [#34942](https://github.com/storybookjs/storybook/issues/34942),
[#34946](https://github.com/storybookjs/storybook/issues/34946),
[#34950](https://github.com/storybookjs/storybook/pull/34950),
[#35007](https://github.com/storybookjs/storybook/issues/35007).

## Branches

| Branch    | Framework                                          | Result           |
| --------- | -------------------------------------------------- | ---------------- |
| `main`    | stock `storybook@10.5.0`                           | 9/9 stories fail |
| `next`    | stock `storybook@next` (latest alpha)              | 9/9 stories fail |
| `patched` | `10.5.0` + `patch-package` dist built from the fix | 9/9 stories pass |

The `patched` branch applies the built output of
[storybookjs/storybook#35465](https://github.com/storybookjs/storybook/pull/35465)
and its stacked follow-ups
([fork PR #2](https://github.com/unpunnyfuns/storybook/pull/2),
[fork PR #3](https://github.com/unpunnyfuns/storybook/pull/3)) over the stock
`dist/`, as evidence the fix resolves every failure below.

## Run it

```bash
npm install
npx playwright install chromium   # once, for the story test runner
npm test                          # every story's play function, headless
npm run storybook                 # browse the failures interactively on :6006
npm run dev                       # the app itself, working, for comparison
```

## Stories

All stories render the **real route components** through
`parameters.tanstack.router` (`route`, `path`, `params`, `query`,
`routeOverrides`, `context`). On `main` every one of them fails with the
duplicate-route invariant above.

| Story file                                   | Exercises                                                   |
| -------------------------------------------- | ----------------------------------------------------------- |
| `src/routes/about.stories.tsx`               | Plain flat route; fails despite touching nothing pathless   |
| `src/routes/_authed/dashboard.stories.tsx`   | Route under a pathless layout, at its real URL `/dashboard` |
| `src/routes/_authed/route.stories.tsx`       | Story bound directly to the pathless layout route (#34942)  |
| `src/routes/users/index.stories.tsx`         | Route under a pathful layout                                |
| `src/routes/users/$userId.stories.tsx`       | Dynamic param + loader                                      |
| `src/routes/posts/index.stories.tsx`         | Search-param validation, filters (`query`)                  |
| `src/routes/posts/$postId/index.stories.tsx` | Nested layout under a param, `params` + `query` together    |

Expected behavior for each page is described in the app UI itself
(`npm run dev`), so the correct baseline is visible before reading any code.

## Feature → file map

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
