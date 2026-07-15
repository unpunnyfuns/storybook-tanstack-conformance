# storybook-tanstack-conformance

### Router

| stories passing    | file-based                                                                                                                                                                | code-based                                                                                                                                                                          | virtual routes                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook@latest` | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router.json)   | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-code.json)   | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-virtual.json)   |
| `storybook@next`   | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router.json)   | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-code.json)   | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-virtual.json)   |
| `storybook@canary` | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-router.json) | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-router-code.json) | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-router-virtual.json) |

### Start

| stories passing    | file-based                                                                                                                                                              | code-based                                                                                                                                                                        | virtual routes                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook@latest` | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start.json)   | ![start-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start-code.json)   | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start-virtual.json)   |
| `storybook@next`   | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start.json)   | ![start-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start-code.json)   | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start-virtual.json)   |
| `storybook@canary` | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-start.json) | ![start-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-start-code.json) | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-canary-start-virtual.json) |

Story-level conformance suite for `@storybook/tanstack-react`, run against
real applications covering the whole routing grid: TanStack Router and
TanStack Start, each with file-based, code-based, and virtual routing. Every
scenario is a story with a play function asserting on rendered output;
`npm test` runs all suites in a headless browser, so a framework regression
shows up as red tests.

Each app is its own control: every route works when the app runs normally
(`npm run dev` in the workspace). Anything red in the story suites is a
framework issue, not an app issue.

## Workspaces

The suite covers the full routing-mode grid: TanStack Router and TanStack
Start, each with file-based, code-based, and virtual routing.

|            | File-based         | Code-based             | Virtual routes            |
| ---------- | ------------------ | ---------------------- | ------------------------- |
| **Router** | `apps/router` (35) | `apps/router-code` (4) | `apps/router-virtual` (3) |
| **Start**  | `apps/start` (36)  | `apps/start-code` (2)  | `apps/start-virtual` (2)  |

82 stories total. The two file-based apps carry the full scenario matrix
below; the code and virtual apps prove the same framework machinery against
their routing modes (id-only layouts, params + search, loaders and
loaderDeps, server functions, tree mode).

## Scenario matrix

| Scenario                                                              | Router | Start |
| --------------------------------------------------------------------- | ------ | ----- |
| Flat route bound via `route` + `path`                                 | ✅     | ✅    |
| Root index route with `validateSearch` + `query`                      | ✅     | —     |
| Route in a `(group)` directory (group-free URL)                       | ✅     | ✅    |
| Route nested under a pathful layout                                   | ✅     | ✅    |
| Path param + loader; `params` interpolation                           | ✅     | ✅    |
| `notFound()` thrown from a loader                                     | ✅     | ✅    |
| `routeOverrides` replacing a loader with mock data                    | ✅     | ✅    |
| `routeOverrides` disabling a `beforeLoad` guard; router `context`     | ✅     | ✅    |
| `validateSearch` + `query` (filters, pagination, sort)                | ✅     | ✅    |
| Nested layout under a param; `params` and `query` together            | ✅     | ✅    |
| Nested pathless layout; strict-mode `Route.useLoaderData()`           | ✅     | ✅    |
| Splat route (`params: { _splat }`)                                    | ✅     | ✅    |
| Optional path param (`{-$category}`)                                  | ✅     | ✅    |
| Param with a static prefix (`order-{$orderId}`)                       | ✅     | ✅    |
| Lazy file route (`*.lazy.tsx`) paired with an eager loader            | ✅     | ✅    |
| `loaderDeps`: loader keyed off a search param                         | ✅     | ✅    |
| Async loader + route-level `pendingComponent`                         | ✅     | ✅    |
| Loader throws + route-level `errorComponent`                          | ✅     | ✅    |
| Pathless layout with an index child; `beforeLoad` context             | ✅     | ✅    |
| Story bound directly to a pathless layout (with and without children) | ✅     | ✅    |
| Sibling pathless layouts                                              | ✅     | ✅    |
| TanStack Query: loader `ensureQueryData` + `useSuspenseQuery`         | ✅     | ✅    |
| TanStack Query: cache seeded per story via `setQueryData`             | ✅     | ✅    |
| TanStack Query: per-story isolated client via `useRouterContext`      | ✅     | ✅    |
| Plain component + synthetic route from options (`route: { path }`)    | ✅     | ✅    |
| URL fragment (hash) provided through `path`                           | ✅     | ✅    |
| Programmatic navigation asserted on the `useNavigate` spy             | ✅     | ✅    |
| Tree mode: leaf selected by `path` (+ `params`) in the generated tree | ✅     | ✅    |
| Code-based (`createRoute`) tree: bound, param + search, tree mode     | ✅     | ✅    |
| Server function in a loader (mocked per story)                        | —      | ✅    |
| Per-story server states (same route, different responses)             | —      | ✅    |
| Server-only module replaced via `sb.mock` + `__mocks__`               | —      | ✅    |
| Rendering under a Start root (`shellComponent`)                       | —      | ✅    |

## TanStack Query

Per the framework docs: one `QueryClient` is created in each app's
`.storybook/preview.tsx`, cleared between stories, and shared through both
`parameters.tanstack.router.context` and a `QueryClientProvider` decorator.
Stories seed the cache in `beforeEach`:

```ts
export const Seeded: Story = {
  beforeEach: ({ parameters }) => {
    const queryClient = parameters.tanstack?.router?.context?.queryClient;
    queryClient?.setQueryData(["reviews"], [{ id: "9", author: "Grace", text: "Seeded." }]);
  },
};
```

## Server functions (Start)

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

| Branch   | Framework                                        |
| -------- | ------------------------------------------------ |
| `main`   | stock `storybook@latest`                         |
| `next`   | stock `storybook@next` (latest alpha)            |
| `canary` | stock `storybook@canary` (most recent PR canary) |

The canary dist-tag points at whichever per-PR canary build was published
most recently, so its results can swing with unrelated work; the badge label
carries the exact version.

Both branches stay stock so results always reflect released framework
behavior; `npm update` pulls the newest release on either.

A daily CI run installs the current dist-tag resolutions from scratch, runs
every app's suite on both branches, and publishes the counts to the `status`
branch, which feeds the badges above. No automated commits ever land on
`main`; the badges are the record.

## Known rendering caveat

A Start root route's `shellComponent` renders its full document
(`<html>`/`<body>`) inside the story canvas, which React flags as invalid
nesting in the console. Stories still render.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the suite is maintained and verified by a human.
