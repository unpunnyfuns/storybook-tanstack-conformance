# storybook-tanstack-conformance

Story-level conformance suite for `@storybook/tanstack-react` against a real
TanStack Router application, in both file-based and code-based (config) setups. Every
scenario is a story with a play function asserting on rendered output;
`npm test` runs the whole suite in a headless browser, so a framework
regression shows up as red tests, not as a vague "stories look broken".

The app itself (`npm run dev`) is the control: every route works in the
browser, and each page describes its own expected behavior in the UI. Anything
red in the story suite is a framework issue, not an app issue.

## What is tested

### File-based routes (generated tree)

| Story file                                       | Scenario                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/routes/index.stories.tsx`                   | Root index route; `validateSearch` + `query` banner variant                                               |
| `src/routes/about.stories.tsx`                   | Flat route bound via `route` + `path`                                                                     |
| `src/routes/(marketing)/pricing.stories.tsx`     | Route in a `(group)` directory, served at its group-free URL                                              |
| `src/routes/users/index.stories.tsx`             | Route nested under a pathful layout                                                                       |
| `src/routes/users/$userId.stories.tsx`           | Path param + loader (`params` interpolation); `notFound()` variant                                        |
| `src/routes/posts/index.stories.tsx`             | `validateSearch` + `query` (filters, pagination, sort)                                                    |
| `src/routes/posts/$postId/index.stories.tsx`     | Nested layout under a param; `params` and `query` together                                                |
| `src/routes/posts/_archive/archived.stories.tsx` | Leaf under a **nested pathless layout** (`/posts/_archive`), strict-mode `Route.useLoaderData()`          |
| `src/routes/files/$.stories.tsx`                 | Splat route; `params: { _splat }` interpolation                                                           |
| `src/routes/blog/blog.stories.tsx`               | **Optional path param** (`{-$category}`): matched with and without the param                              |
| `src/routes/orders/orders.stories.tsx`           | Param with a **static prefix** (`order-{$orderId}`)                                                       |
| `src/routes/lazy-page.stories.tsx`               | **Lazy file route** (`*.lazy.tsx` via `createLazyFileRoute`) paired with an eager loader                  |
| `src/routes/search.stories.tsx`                  | `loaderDeps`: loader keyed off a search param, driven by `query`                                          |
| `src/routes/slow.stories.tsx`                    | Async loader with a route-level `pendingComponent`                                                        |
| `src/routes/boom.stories.tsx`                    | Loader throws; route-level `errorComponent` renders                                                       |
| `src/routes/settings/_tabs/index.stories.tsx`    | Index child of a pathless layout; **`beforeLoad` context** consumed by the child                          |
| `src/routes/settings/_tabs/route.stories.tsx`    | Story bound directly to a pathless layout **that has an index child**                                     |
| `src/routes/_authed/dashboard.stories.tsx`       | Route under a **pathless layout** at its real URL; `routeOverrides` disabling the guard; router `context` |
| `src/routes/_authed/route.stories.tsx`           | Story bound **directly to a pathless layout route**                                                       |
| `src/routes/_admin/audit.stories.tsx`            | Route under a second pathless layout (**sibling pathless layouts**)                                       |
| `src/routes/users/$userId.stories.tsx`           | (also) `routeOverrides` replacing a **loader** with mock data                                             |
| `src/tree-mode.stories.tsx`                      | Tree mode with the generated tree: story component injected at the leaf selected by `path` (+ `params`)   |

### Code-based routes (`createRoute` config tree)

| Story file                                  | Scenario                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/code-based/code-based.stories.tsx`     | Story bound to a single `createRoute()`; loader list, and a param route + search validation under an **id-only pathless layout** |
| `src/code-based/code-tree-mode.stories.tsx` | Tree mode with the code-based tree: leaf selected by `path` + `params`                                                           |

32 stories across 23 files. All stories render real route components (or, in
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

| Branch | Framework                             |
| ------ | ------------------------------------- |
| `main` | stock `storybook@latest`              |
| `next` | stock `storybook@next` (latest alpha) |

Both branches stay stock so results always reflect released framework
behavior; `npm update` pulls the newest release on either.

## App structure

| Feature                                                             | File                                     |
| ------------------------------------------------------------------- | ---------------------------------------- |
| Root layout, nav, error + notFound boundaries, `RouterContext` type | `src/routes/__root.tsx`                  |
| Home / feature index + `validateSearch` for `redirectedFrom`        | `src/routes/index.tsx`                   |
| Flat route                                                          | `src/routes/about.tsx`                   |
| Group directory route (URL-invisible segment)                       | `src/routes/(marketing)/pricing.tsx`     |
| Layout route + nested `<Outlet>`                                    | `src/routes/users/route.tsx`             |
| Dynamic path param + loader + `notFound()`                          | `src/routes/users/$userId.tsx`           |
| Search-param validation, filters, pagination                        | `src/routes/posts/index.tsx`             |
| Nested layout under a param                                         | `src/routes/posts/$postId/route.tsx`     |
| Nested pathless layout under a pathful segment                      | `src/routes/posts/_archive/route.tsx`    |
| Splat route                                                         | `src/routes/files/$.tsx`                 |
| Optional path param                                                 | `src/routes/blog/{-$category}.tsx`       |
| Prefixed path param                                                 | `src/routes/orders/order-{$orderId}.tsx` |
| Lazy file route (eager loader + lazy component)                     | `src/routes/lazy-page.tsx` + `.lazy.tsx` |
| `loaderDeps`-keyed loader                                           | `src/routes/search.tsx`                  |
| Slow loader + `pendingComponent`                                    | `src/routes/slow.tsx`                    |
| Loader that throws + route-level `errorComponent`                   | `src/routes/boom.tsx`                    |
| Pathless layout providing `beforeLoad` context, with index child    | `src/routes/settings/_tabs/route.tsx`    |
| Pathless layout + `beforeLoad` guard + `redirect`                   | `src/routes/_authed/route.tsx`           |
| Sibling pathless layout                                             | `src/routes/_admin/route.tsx`            |
| Route context consumer                                              | `src/routes/_authed/dashboard.tsx`       |
| Standalone code-based tree (id-only layout, loader, param + search) | `src/code-based/tree.tsx`                |

`src/routeTree.gen.ts` is generated by `@tanstack/router-plugin`; it is
gitignored and regenerates on `npm run dev` / `npm test`.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the repro is maintained and verified by a human.
