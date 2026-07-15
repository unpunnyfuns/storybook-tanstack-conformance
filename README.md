# storybook-tanstack-conformance

Story-level conformance suite for `@storybook/tanstack-react`, run against two
real applications: a TanStack Router SPA and a TanStack Start app. Every
scenario is a story with a play function asserting on rendered output;
`npm test` runs both suites in a headless browser, so a framework regression
shows up as red tests.

Each app is its own control: every route works when the app runs normally
(`npm run dev` in the workspace). Anything red in the story suites is a
framework issue, not an app issue.

## Workspaces

| Workspace     | App                                            | Stories |
| ------------- | ---------------------------------------------- | ------- |
| `apps/router` | TanStack Router SPA, file + code based routing | 32      |
| `apps/start`  | TanStack Start (server functions, shell root)  | 4       |

## What is tested

### `apps/router`: file-based routes (generated tree)

| Story file                                       | Scenario                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/routes/index.stories.tsx`                   | Root index route; `validateSearch` + `query` banner variant                                               |
| `src/routes/about.stories.tsx`                   | Flat route bound via `route` + `path`                                                                     |
| `src/routes/(marketing)/pricing.stories.tsx`     | Route in a `(group)` directory, served at its group-free URL                                              |
| `src/routes/users/index.stories.tsx`             | Route nested under a pathful layout                                                                       |
| `src/routes/users/$userId.stories.tsx`           | Path param + loader (`params` interpolation); `notFound()` variant; `routeOverrides` replacing a loader   |
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
| `src/tree-mode.stories.tsx`                      | Tree mode with the generated tree: story component injected at the leaf selected by `path` (+ `params`)   |

### `apps/router`: code-based routes (`createRoute` config tree)

| Story file                                  | Scenario                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/code-based/code-based.stories.tsx`     | Story bound to a single `createRoute()`; loader list, and a param route + search validation under an **id-only pathless layout** |
| `src/code-based/code-tree-mode.stories.tsx` | Tree mode with the code-based tree: leaf selected by `path` + `params`                                                           |

### `apps/start`: TanStack Start

| Story file                             | Scenario                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `src/routes/index.stories.tsx`         | Loader calling a **server function**; per-story server states (list and empty)  |
| `src/routes/items/$itemId.stories.tsx` | Param route whose loader calls a server function with input validation          |
| `src/routes/_gated/panel.stories.tsx`  | Pathless layout with `beforeLoad` context under a Start root (`shellComponent`) |

Server-function handlers never run in stories: the framework strips them from
the client bundle (as Start itself does) and exports each server function as a
spy. Stories provide results in `beforeEach`, which runs after the automatic
mock reset:

```ts
import { type Mock } from "storybook/test";
import { listItems } from "../server-functions";

const meta = {
  beforeEach() {
    (listItems as unknown as Mock).mockResolvedValue(items);
  },
};
```

## Run it

```bash
npm install
npx playwright install chromium   # once, for the story test runner
npm test                          # both apps' stories, headless
npm run test:router               # one app at a time
npm run test:start
npm run storybook:router          # browse on :6006
npm run storybook:start           # browse on :6007
```

## Branches

| Branch | Framework                             |
| ------ | ------------------------------------- |
| `main` | stock `storybook@latest`              |
| `next` | stock `storybook@next` (latest alpha) |

Both branches stay stock so results always reflect released framework
behavior; `npm update` pulls the newest release on either.

## Known rendering caveat

A Start root route's `shellComponent` renders its full document
(`<html>`/`<body>`) inside the story canvas, which React flags as invalid
nesting in the console. Stories still render.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the suite is maintained and verified by a human.
