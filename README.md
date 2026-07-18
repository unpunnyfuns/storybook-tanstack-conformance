# storybook-tanstack-conformance

### Router

| stories passing    | file-based                                                                                                                                                                | code-based                                                                                                                                                                          | virtual routes                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook@latest` | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router.json)   | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-code.json)   | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-virtual.json)   |
| `storybook@next`   | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router.json)   | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-code.json)   | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-virtual.json)   |
| [`patched`](#pending-fixes) | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router.json) | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-code.json) | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-virtual.json) |

### Start

| stories passing    | file-based                                                                                                                                                              | code-based | virtual routes                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook@latest` | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start.json)   | n/a        | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start-virtual.json)   |
| `storybook@next`   | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start.json)   | n/a        | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start-virtual.json)   |
| [`patched`](#pending-fixes) | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start.json) | n/a        | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start-virtual.json) |

### Apps (pure TanStack, no Storybook)

Playwright end-to-end tests run each app as a real dev server, so the routes
themselves are verified independently of Storybook.

| app e2e    | file-based                                                                                                                                                                 | code-based                                                                                                                                                                           | virtual routes                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Router** | ![router e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router.json) | ![router-code e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-code.json) | ![router-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-virtual.json) |
| **Start**  | ![start e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start.json)   | n/a                                                                                                                                                                                  | ![start-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start-virtual.json)   |

Story-level conformance suite for `@storybook/tanstack-react`, run against
real applications covering the whole routing grid: TanStack Router and
TanStack Start, each with file-based, code-based, and virtual routing. Every
scenario is a story with a play function asserting on rendered output;
`npm test` runs all suites in a headless browser, so a framework regression
shows up as red tests.

Each app is its own control: every route works when the app runs normally
(`npm run dev` in the workspace). When the app works and its stories do not,
the framework is the place to look.

## Workspaces

The suite covers the full routing-mode grid: TanStack Router and TanStack
Start, each with file-based, code-based, and virtual routing.

|            | File-based         | Code-based                                         | Virtual routes            |
| ---------- | ------------------ | -------------------------------------------------- | ------------------------- |
| **Router** | `apps/router` (38) | `apps/router-code` (4)                             | `apps/router-virtual` (3) |
| **Start**  | `apps/start` (37)  | n/a ([why](#why-there-is-no-code-based-start-app)) | `apps/start-virtual` (3)  |

85 stories total. The two file-based apps carry the full scenario matrix
below; the code and virtual apps prove the same framework machinery against
their routing modes (id-only layouts, params + search, loaders and
loaderDeps, server functions, tree mode).

Most pending fixes are **common** issues in shared framework code
(`duplicateRouteTree`, mock resolution, the `Link` mock) that every routing
mode runs through; only the document-shell fix is mode-specific (Start). The
file-based apps carry the deepest coverage, so they surface those common
issues first. A high pass rate on the thinner code and virtual apps therefore
reflects lighter coverage, not immunity: the same common fixes apply there
once equivalent stories exist. The `Scope` column below marks which is which.

Every app also runs as a real application, verified by Playwright
end-to-end tests (`npm run e2e`) that exercise the actual routing:
navigation, search params, guards, params, splats, error and notFound
boundaries. The two file-based apps share one rich suite (their route trees
are mirrored); the virtual apps share another. With the apps verified
independently, a red story suite points at the framework rather than the
app under test.

### Why there is no code-based Start app

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

### Common (every routing mode)

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
| `routeOverrides` replacing a route's `component`                      | ✅     | —     |
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
| `Link` mock: `href` interpolated, `params` kept off the DOM           | ✅     | —     |
| Mock module identity: documented import is the intercepted instance   | ✅     | —     |
| Tree mode: leaf selected by `path` (+ `params`) in the generated tree | ✅     | ✅    |
| Code-based (`createRoute`) tree: bound, param + search, tree mode     | ✅     | ✅    |

### Start-specific (server functions and the document shell)

| Scenario                                                              | Router | Start |
| --------------------------------------------------------------------- | ------ | ----- |
| Server function in a loader (mocked per story)                        | —      | ✅    |
| Per-story server states (same route, different responses)             | —      | ✅    |
| Server-only module replaced via `sb.mock` + `__mocks__`               | —      | ✅    |
| Rendering under a Start root (`shellComponent`)                       | —      | ✅    |
| Start `shellComponent` (document shell) kept out of the story canvas  | —      | ✅    |

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
npx playwright install chromium   # once, for the test runners
npm test                          # every app's stories, headless
npm run test -w apps/router       # one app at a time
npm run e2e                       # the apps themselves, as real dev servers
npm run storybook -w apps/router  # browse one app's stories
npm run dev -w apps/router        # run one app
```

## Branches

| Branch    | Framework                                              |
| --------- | ------------------------------------------------------ |
| `main`    | stock `storybook@latest`                               |
| `next`    | stock `storybook@next` (latest alpha)                  |
| `patched` | `storybook@next` plus the pending fixes listed below |

The stock branches stay stock so results always reflect released framework
behavior; `npm update` pulls the newest release on any of them.

A daily CI run installs the current dist-tag resolutions from scratch, runs
every app's suite on each branch, and publishes the counts to the `status`
branch, which feeds the badges above. No automated commits ever land on
`main`; the badges are the record.

## Pending fixes

The `patched` branch installs a prebuilt framework tarball from the
[conformance-build release](https://github.com/unpunnyfuns/storybook-tanstack-conformance/releases/tag/conformance-build):
`storybook@next` plus these fixes, built from
[unpunnyfuns/storybook#conformance-build](https://github.com/unpunnyfuns/storybook/tree/conformance-build).
A scheduled workflow rebuilds the tarball whenever the framework changes
upstream or a fix branch moves; a failed rebuild means the pending PRs need
a rebase, and the release keeps serving the last good build meanwhile. The
`patched` row therefore shows what `next` looks like once these are merged:

| Fix                                                                                | Scope | Status | Stories fixed |
| ---------------------------------------------------------------------------------- | ----- | ------ | ------------- |
| [#35497](https://github.com/storybookjs/storybook/pull/35497) route overrides matched by id | common | open   | 1  |
| [#35498](https://github.com/storybookjs/storybook/pull/35498) story leaf selection   | common | open   | 7  |
| [#35499](https://github.com/storybookjs/storybook/pull/35499) route ids in cloning   | common | open   | 6  |
| [#35500](https://github.com/storybookjs/storybook/pull/35500) lazy bindings in cloning | common | open  | 2 |
| [#35501](https://github.com/storybookjs/storybook/pull/35501) mock module resolution | common | open   | 1  |
| [#35504](https://github.com/storybookjs/storybook/pull/35504) document shell kept out of stories | Start-only | merged, awaiting release | 2 |
| [#35505](https://github.com/storybookjs/storybook/pull/35505) real link hrefs in the `Link` mock | common | open | 1 |

Story counts are attributed per fix from the stock failure set; the sum (20)
is verified jointly by the stock and patched rows differing by exactly that
many stories. [#35504](https://github.com/storybookjs/storybook/pull/35504) is
merged upstream but not yet in a `next` release tag, so it still counts toward
the gap until an alpha ships it.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the suite is maintained and verified by a human.
