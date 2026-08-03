# storybook-tanstack-conformance

### Router

<!-- generated:badges-router -->

| stories passing             | file-based                                                                                                                                                                 | code-based                                                                                                                                                                           | virtual routes                                                                                                                                                                             | app shell (root pathless layout)                                                                                                                                                       | CSF factories                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `storybook@latest`          | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router.json)    | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-code.json)    | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-virtual.json)    | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-shell.json)    | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-csf4.json)    |
| `storybook@next`            | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router.json)    | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-code.json)    | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-virtual.json)    | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-shell.json)    | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-csf4.json)    |
| [`patched`](#pending-fixes) | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router.json) | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-code.json) | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-virtual.json) | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-shell.json) | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-csf4.json) |

<!-- generated:end -->

### Start

<!-- generated:badges-start -->

| stories passing             | file-based                                                                                                                                                               | virtual routes                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook@latest`          | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start.json)    | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start-virtual.json)    |
| `storybook@next`            | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start.json)    | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start-virtual.json)    |
| [`patched`](#pending-fixes) | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start.json) | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start-virtual.json) |

<!-- generated:end -->

The file-based columns carry the deepest scenario coverage, so their counts
include issues common to every routing mode, not just file-based ones. The
thinner code-based and virtual columns simply do not exercise those common
cases yet ([scope breakdown](#pending-fixes)).

### Apps (pure TanStack, no Storybook)

Playwright end-to-end tests run each app as a real dev server, so the routes
themselves are verified independently of Storybook.

<!-- generated:badges-e2e -->

| app e2e    | file-based                                                                                                                                                                 | code-based                                                                                                                                                                           | virtual routes                                                                                                                                                                             | app shell (root pathless layout)                                                                                                                                                       | CSF factories                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Router** | ![router e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router.json) | ![router-code e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-code.json) | ![router-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-virtual.json) | ![router-shell e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-shell.json) | ![router-csf4 e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-csf4.json) |
| **Start**  | ![start e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start.json)   | n/a                                                                                                                                                                                  | ![start-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start-virtual.json)   | n/a                                                                                                                                                                                    | n/a                                                                                                                                                                                  |

<!-- generated:end -->

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

<!-- generated:workspaces -->

| App                   | Family | Routing / format                 | Stories |
| --------------------- | ------ | -------------------------------- | ------- |
| `apps/router`         | Router | file-based                       | 41      |
| `apps/router-code`    | Router | code-based                       | 4       |
| `apps/router-virtual` | Router | virtual routes                   | 3       |
| `apps/start`          | Start  | file-based                       | 47      |
| `apps/start-virtual`  | Start  | virtual routes                   | 3       |
| `apps/router-shell`   | Router | app shell (root pathless layout) | 4       |
| `apps/router-csf4`    | Router | CSF factories                    | 5       |

107 stories total (from expectations.json, channel `main`).

<!-- generated:end -->

`apps/router-shell` is a second file-based Router app for one route
shape the grid above cannot host. Its whole route tree lives under a
root-level pathless layout, so the layout's index owns `/` and the app has no
`src/routes/index.tsx`. `apps/router` cannot cover this because its own root
index already claims `/`; a root-level pathless layout with an index child
would collide with it. The shape is the standard app-shell pattern: chrome
and auth context in one layout, a `/login` route outside it.

`apps/router-csf4` is the same framework driven through CSF factories
rather than CSF3, using `defineMain`, `definePreview`, `preview.meta()` and
`meta.story()` as the automigration generates them. The Vite builder takes a
different code path for a CSF factory preview, emitting an import only for the
preview file itself and dropping every module a framework or addon preset
contributed through `previewAnnotations`. That switch is per project, so it
cannot be covered from inside an app written in CSF3.

`npm run check` asserts each app is on the format its name claims, since the
builder decides by looking for a `definePreview` import and an ordinary edit to
a preview file would otherwise move an app between paths unnoticed.

The two grid file-based apps carry the full scenario matrix
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

## Run it

```bash
npm install
npx playwright install chromium   # once, for the test runners
npm test                          # every app's stories, headless
                                  # (also generates the gitignored routeTree.gen
                                  #  files, so run it before `npm run check` on
                                  #  a fresh clone)
npm test -w apps/router           # one app at a time
npm run e2e                       # the apps themselves, as real dev servers
npm run storybook -w apps/router  # browse one app's stories
npm run dev -w apps/router        # run one app
```

Per-app commands go through npm workspaces (`-w apps/<name>`); there are no
per-app scripts at the root to keep in sync.

## Channels

Everything lives on one branch. Which framework build the suite measures is a
channel, selected by rewriting the apps' dependency specs:

| Channel   | Framework                                            |
| --------- | ---------------------------------------------------- |
| `main`    | stock `storybook@latest`                             |
| `next`    | stock `storybook@next` (latest alpha)                |
| `patched` | `storybook@next` plus the pending fixes listed below |

```bash
node scripts/channel.mjs next   # point every app at a channel
npm install
git checkout -- apps            # back to the committed channel (main)
```

Channels used to be git branches whose entire diff was these dependency
specs. That meant cherry-picking every change three times, and a partial
rollout once left three apps on the `next` branch silently measuring
`latest`. The script hits all apps or none.

A daily CI run selects each channel in turn, installs its current
resolutions from scratch, runs every app's suite, and publishes the counts
to the `status` branch, which feeds the badges above. No automated commits
ever land on `main`; the badges are the record.

## Pending fixes

The `patched` channel installs a prebuilt framework tarball from the
[conformance-build release](https://github.com/unpunnyfuns/storybook-tanstack-conformance/releases/tag/conformance-build):
`storybook@next` plus these fixes, built from
[unpunnyfuns/storybook#conformance-build](https://github.com/unpunnyfuns/storybook/tree/conformance-build).
A scheduled workflow rebuilds the tarball whenever the framework changes
upstream or a fix branch moves; a failed rebuild means the pending PRs need
a rebase, and the release keeps serving the last good build meanwhile. The
`patched` row therefore shows what `next` looks like once these are merged:

<!-- generated:fixes -->

| Fix                                                                                              | Scope      | Status | In `latest` | In `next` | Stories fixed |
| ------------------------------------------------------------------------------------------------ | ---------- | ------ | ----------- | --------- | ------------- |
| [#35497](https://github.com/storybookjs/storybook/pull/35497) route overrides matched by id      | common     | merged | yes         | yes       | 1             |
| [#35498](https://github.com/storybookjs/storybook/pull/35498) story leaf selection               | common     | merged | no          | not yet   | 7             |
| [#35499](https://github.com/storybookjs/storybook/pull/35499) route ids in cloning               | common     | merged | yes         | not yet   | 6             |
| [#35500](https://github.com/storybookjs/storybook/pull/35500) lazy bindings in cloning           | common     | merged | no          | not yet   | 2             |
| [#35501](https://github.com/storybookjs/storybook/pull/35501) mock module resolution             | common     | merged | yes         | not yet   | 1             |
| [#35504](https://github.com/storybookjs/storybook/pull/35504) document shell kept out of stories | Start-only | merged | not needed  | yes       | 2             |
| [#35505](https://github.com/storybookjs/storybook/pull/35505) real link hrefs in the Link mock   | common     | open   | no          | no        | 1             |

<!-- generated:end -->

`latest` is currently **ahead of** `next` on these fixes. #35497, #35499 and
#35501 were backported into 10.5.5, while the newest `next` alpha
(10.6.0-alpha.3) was cut before the last two of them merged. #35504 is only
relevant from 10.6 onward, since the 10.5.x line does not render a document
shell in the first place, so its two stories pass on `latest` without it.

Story counts are attributed per fix from the stock failure set, and each stock
row's failures are exactly the sum of the fixes it is missing:

- `latest` 10.5.5, 10 failing = #35498 (7) + #35500 (2) + #35505 (1)
- `next` 10.6.0-alpha.3, 17 failing = the same three plus #35499 (6) and #35501 (1)

## Plans and audits

The framework is being aligned with real TanStack behavior incrementally; the audit that drives the work and the phase-by-phase plans are public for external review in [docs/plans](docs/plans/README.md) and [docs/audits](docs/audits/2026-08-01-framework-audit.md). Corrections and challenges are welcome as issues on this repo.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are
tagged `ai-generated`; the suite is maintained and verified by a human.
