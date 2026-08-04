# Scenarios

What the suite actually asserts, and why each scenario is where it is. The [README](../README.md) covers what the project is and how to run it; this file covers what it measures.

## Contents

- [Why there is no code-based Start app](#why-there-is-no-code-based-start-app)
- [Scenario matrix](#scenario-matrix)
- [TanStack Query](#tanstack-query)
- [Server functions (Start)](#server-functions-start)

## Why there is no code-based Start app

TanStack Start cannot produce a production build from a purely code-based
route tree: its
[manifest builder](https://github.com/TanStack/router/blob/main/packages/start-plugin-core/src/start-manifest-plugin/manifestBuilder.ts)
requires every route to carry a generated file path. Plain `createRoute()`
objects have no files, so there is nothing to generate from, and a
configuration that cannot ship is not worth conformance-testing. If you
want the route structure in code on Start, use virtual routes
(`apps/start-virtual`): structure declared in code, implementations in
files, fully buildable.

## Scenario matrix

Most scenarios are **common** — they exercise shared framework machinery and
hold for any routing mode. A `—` marks where a scenario is not yet mirrored in
that app, not a gap in support: the common fixes apply to the code and virtual
apps too, once equivalent stories exist. The Start section below is genuinely
mode-specific (server functions and the document shell).

A ✓ means the scenario is covered by a story, not that the story passes on
every channel. Several of these are gauges that are red by design on the stock
channels, which is the instrument working rather than a defect. The badges
above carry the pass rates.

### Common (every routing mode)

| Scenario                                                                | Router | Start |
| ----------------------------------------------------------------------- | ------ | ----- |
| Flat route bound via `route` + `path`                                   | ✓      | ✓     |
| Root index route with `validateSearch` + `query`                        | ✓      | —     |
| Route in a `(group)` directory (group-free URL)                         | ✓      | ✓     |
| Route nested under a pathful layout                                     | ✓      | ✓     |
| Path param + loader; `params` interpolation                             | ✓      | ✓     |
| `notFound()` thrown from a loader                                       | ✓      | ✓     |
| `routeOverrides` replacing a loader with mock data                      | ✓      | ✓     |
| `routeOverrides` disabling a `beforeLoad` guard; router `context`       | ✓      | ✓     |
| `routeOverrides` replacing a route's `component`                        | ✓      | —     |
| `validateSearch` + `query` (filters, pagination, sort)                  | ✓      | ✓     |
| Nested layout under a param; `params` and `query` together              | ✓      | ✓     |
| Nested pathless layout; strict-mode `Route.useLoaderData()`             | ✓      | ✓     |
| Splat route (`params: { _splat }`)                                      | ✓      | ✓     |
| Optional path param (`{-$category}`)                                    | ✓      | ✓     |
| Param with a static prefix (`order-{$orderId}`)                         | ✓      | ✓     |
| Lazy file route (`*.lazy.tsx`) paired with an eager loader              | ✓      | ✓     |
| `loaderDeps`: loader keyed off a search param                           | ✓      | ✓     |
| Async loader + route-level `pendingComponent`                           | ✓      | ✓     |
| Loader throws + route-level `errorComponent`                            | ✓      | ✓     |
| Pathless layout with an index child; `beforeLoad` context               | ✓      | ✓     |
| Story bound directly to a pathless layout (with and without children)   | ✓      | ✓     |
| Sibling pathless layouts                                                | ✓      | ✓     |
| TanStack Query: loader `ensureQueryData` + `useSuspenseQuery`           | ✓      | ✓     |
| TanStack Query: cache seeded per story via `setQueryData`               | ✓      | ✓     |
| TanStack Query: per-story isolated client via `useRouterContext`        | ✓      | ✓     |
| Plain component + synthetic route from options (`route: { path }`)      | ✓      | ✓     |
| URL fragment (hash) provided through `path`                             | ✓      | ✓     |
| Programmatic navigation asserted on the `useNavigate` spy               | ✓      | ✓     |
| Navigation by `Link`, by `useNavigate` and by `<Navigate>` side by side | ✓      | —     |
| `Link` mock: `href` interpolated, `params` kept off the DOM             | ✓      | —     |
| Mock module identity: documented import is the intercepted instance     | ✓      | —     |
| Tree mode: leaf selected by `path` (+ `params`) in the generated tree   | ✓      | ✓     |
| Code-based (`createRoute`) tree: bound, param + search, tree mode       | ✓      | ✓     |
| Root-level pathless layout owning the index (`apps/router-shell`)       | ✓      | —     |
| CSF factories: `definePreview` + `preview.meta` (`apps/router-csf4`)    | ✓      | —     |

### Start-specific (server functions and the document shell)

Every scenario here is covered in `apps/start`; Router does not apply.

- Server function in a loader (mocked per story)
- Per-story server states (same route, different responses)
- Server-only module replaced via `sb.mock` + `__mocks__`
- Rendering under a Start root (`shellComponent`)
- Start `shellComponent` (document shell) kept out of the story canvas
- Server function middleware: `client` phase runs
- Server function middleware: `server` phase seeds the handler context
- Server function validator transforms input before the handler
- Cookie scope: request reads separate from response writes
- Server function returning a `Response` handed back unserialized
- Real chain still runs after Storybook's between-story mock reset
- Server function throwing `redirect()` navigates
- `createStart` instance shape (`getOptions`, `createMiddleware`)
- Global function middleware configured via `createStart`

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
