# Phase 2 design: server-function fidelity by delegation

**Status:** design, approved 2026-08-02. The task-by-task implementation plan follows in a separate document.

**Scope:** audit work package B (server-function mock fidelity) plus finding 8 (`useServerFn` drops redirect handling).
Work package A (the navigation seam) is deliberately excluded and is discussed under [Out of scope](#out-of-scope).

## Contents

- [The problem](#the-problem)
- [The insight](#the-insight)
- [Architecture](#architecture)
- [Backward compatibility](#backward-compatibility)
- [Documentation](#documentation)
- [Verification](#verification)
- [Risks](#risks)
- [How faithful the transport is](#how-faithful-the-transport-is)
- [Out of scope](#out-of-scope)

## The problem

The `createServerFn` mock in `export-mocks/start.ts` hand-writes its own builder chain.
It accepts `.middleware()` and `.validator()` calls and then discards both, so a story never runs the middleware or the validator that the real runtime would run.
Five phase 0 gauges measure this, and all five are red on every channel:

| Gauge                                                   | What the real app does                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `server-probes.stories.tsx > Middleware Server Context` | Middleware server phase seeds `context.user`; the handler reads `ada` |
| `server-probes.stories.tsx > Middleware Client Phase`   | Middleware client phase runs in the browser before the call goes out  |
| `server-probes.stories.tsx > Validator Transforms`      | The validator coerces `"1"` to `1` before the handler adds one        |
| `server-probes.stories.tsx > Cookie Scope`              | `setCookie` writes the response, `getCookie` reads the request        |
| `redirector.stories.tsx > Redirect Navigates`           | A server fn throwing `redirect()` navigates instead of rejecting      |

Each gauge has a Playwright twin in `e2e/start.spec.ts` asserting the identical strings against a real dev server, so the expected values are measured rather than assumed.

This is the audit's first cross-cutting theme in its purest form: the mock re-derives semantics that `@tanstack/start-client-core` already exports, and the re-derivation drifts.

## The insight

The real `createServerFn` already contains the seam this work needs.

Its callable runs `executeMiddleware(resolvedMiddleware, 'client', ...)`, and the last middleware in that chain is `serverFnBaseToMiddleware`, whose two phases are:

- `client`: calls `options.extractedFn(payload)`. In a real Start build the compiler replaces `extractedFn` with an RPC stub, so **this is the transport boundary**.
- `server`: calls `options.serverFn(ctx)`, which is the handler. The validator rides on the same middleware as `inputValidator`, so `executeMiddleware` applies it.

The sibling `__executeServer` runs `executeMiddleware(resolvedMiddleware, 'server', ctx)`.

Both `executeMiddleware` and `flattenMiddlewares` are exported from `@tanstack/start-client-core`, which is a client package and is not on the module-interception plugin's redirect list.
They are reachable from a browser, and phase 1 already established the precedent of importing from that package inside a mock.

**Therefore the mock's entire job reduces to supplying an `extractedFn` that calls `__executeServer` in-process instead of issuing a fetch.**

### The seam is an argument, not an options field

`.handler()` takes **two** arguments in a compiled build: `const [extractedFn, serverFn] = args` (`start-client-core/src/createServerFn.ts:99`, stored at `:106`).
TanStack's compiler rewrites `.handler(fn)` into `.handler(rpcStub, fn)`.

That is a better seam than injecting through options, because the framework already owns a Babel plugin that rewrites `.handler()`. Instead of stripping the handler, it can rewrite `.handler(fn)` into `.handler(inProcessTransport, fn)`, which is structurally the same move TanStack makes and differs only in what the first argument does.

### Two runtime facts that make the in-process path viable

Both were verified by reading the installed packages, because the whole design fails if either is false.

**`__executeServer` does not crash in a browser.** It opens with `getStartContextServerOnly()`, whose name suggests otherwise, but that is `createServerOnlyFn(getStartContext)` and the runtime `createServerOnlyFn` is the identity function `(fn) => fn` (`start-fn-stubs/src/envOnly.ts`). Only a compiler neutralizes it, and the framework's eliminator excludes `node_modules`, so the published `start-client-core` keeps the call intact (confirmed in `dist/esm/getStartContextServerOnly.js`). It therefore resolves to `getStartContext` from `@tanstack/start-storage-context`, which the interception plugin already redirects to the framework's own mock.

**But it does crash when the start context is missing, and that is the same wire as above.** The mock's `createFallbackStartContext` returns `undefined` unless `__TSR_ROUTER__` or `__TSS_START_OPTIONS__` is set (`export-mocks/start-storage-context.ts:14-19`), and `__executeServer` immediately dereferences `startContext.contextAfterGlobalMiddlewares`. So writing `__TSS_START_OPTIONS__` is not only what makes global middleware run, it is what stops the in-process call path throwing at all. Note the fallback also hardcodes `contextAfterGlobalMiddlewares: undefined` and a fresh `new Request('http://localhost/')` per call, which is finding 23 showing through; phase 2 supplies real values for the two fields the call path reads.

## Architecture

Replace the hand-written builder in `export-mocks/start.ts` with a thin wrapper over the real `createServerFn`, injecting the in-process transport.

Everything else is delegated rather than reimplemented:

| Behavior                      | Today          | After                                              |
| ----------------------------- | -------------- | -------------------------------------------------- |
| Client middleware phase       | discarded      | real `executeMiddleware(..., 'client', ...)`       |
| Server middleware phase       | discarded      | real `executeMiddleware(..., 'server', ...)`       |
| Validator                     | discarded      | real, applied as the middleware's `inputValidator` |
| Context merging across phases | absent         | real `safeObjectMerge`                             |
| Redirect detection            | absent         | real `parseRedirect` on the caller's result        |
| Transport                     | n/a (no chain) | in-process call to `__executeServer`               |

The result is less code in the framework, not more.

### The handler, and the framework option

`__executeServer` can only invoke a handler that is still in the bundle, and the elimination plugin currently strips `.handler()` and (since phase 1 task 2) `.validator()`.

Add a framework option, default off, that suppresses those two strips for the build.
The option is deliberately **not** load-bearing for the architecture: the handler is just `options.serverFn` on one middleware, so whether it holds the real handler or a story-supplied stub changes nothing else in the chain.

- **Option on:** the real handler and validator survive, `__executeServer` runs them, and the five gauges go green.
- **Option off:** the chain still runs for real; the story supplies the handler, which is what today's `beforeEach` mocking already does. Existing stories keep working unchanged.

The precondition for turning it on is that the handler's imports are either TanStack's own (already intercepted) or covered by a `__mocks__` file.
The documentation already teaches that technique under "Handling server-only dependencies", for the separate reason of keeping `postgres` and friends out of the browser.

### Cookie semantics

Finding 22 is independent of the chain and is fixed directly in `export-mocks/start.ts`: `setCookie` writes to the response store, `getCookie` reads the request store, and the two stop meeting.
Finding 21 (`setResponseHeaders` replacing rather than merging) is adjacent and cheap, so it is included.

The larger storage-context rework (finding 23) is **not** in scope; `__executeServer` reads `request` and `contextAfterGlobalMiddlewares` from the start context, so phase 2 supplies coherent values for those two and no more.

### What phase 1 changed for this plan

Phase 1's intent audit turned up two things that land directly on this architecture, so they are recorded here rather than rediscovered during implementation.

**Global middleware cannot run in a Storybook build at all. CORRECTED 2026-08-03.**
An earlier version of this section claimed that writing `window.__TSS_START_OPTIONS__` would let `getStartOptions()?.functionMiddleware` find global middleware, and that phase 1's `fix/tanstack-isomorphic-order` was a prerequisite for it. Both claims were wrong, found while implementing task 4.

`getStartOptions` lives inside `@tanstack/start-client-core` and is written as `createIsomorphicFn().client(() => window.__TSS_START_OPTIONS__).server(...)`.
The runtime `createIsomorphicFn` in `@tanstack/start-fn-stubs` is an explicit dummy that discards both implementations and returns a no-op, carrying the comment "this is a dummy function, it will be replaced by the transformer".
Nothing transforms it in a Storybook build: `start-client-core` is absent from the module-interception plugin's redirect list, and the elimination plugin excludes `node_modules`.

So `getStartOptions()` returns `undefined`, `getStartOptions()?.functionMiddleware || []` is always `[]`, and no amount of work on our side changes that. Phase 1's isomorphic-order fix transforms user code; the chain that matters here is in `node_modules` and is never reached.

Task 3 still earns its place, for the other reason: writing the global is what makes `createFallbackStartContext` stop returning `undefined`, which is what stops `__executeServer` throwing on `startContext.contextAfterGlobalMiddlewares`.

**Per-function middleware and validators are unaffected**, because they come from the user's own `.middleware([...])` call and never route through `getStartOptions`. Everything this phase's five gauges measure still works.

Making global middleware run would mean intercepting `getStartOptions`, either by adding `start-client-core` to the interception list or by supplying our own. That is a separate decision and is not required by any gauge.

**Validators run in the server phase, which sharpens the carve-out.**
`executeMiddleware` applies `inputValidator` only when `env === 'server'` (`start-client-core/dist/esm/createServerFn.js:95`).
That is consistent with routing the whole server half through `__executeServer`, and it is the precise reason the validator must survive the build: it is server-phase code, so phase 1 task 2's strip is correct for a client bundle and must be suspended for exactly the same builds that keep the handler.

**Diagnostics use the house logger.**
Phase 1 established the framework's first log call, and it uses `once.warn` from `storybook/internal/client-logger` rather than bare `console.warn`, because it dedupes and respects `LOGLEVEL`. Any diagnostic this phase adds follows that precedent.

### Redirects (finding 8)

The real caller already runs `parseRedirect(result.error)` and rethrows a proper redirect object, so `useServerFn` needs only to catch it and navigate rather than leaving an unhandled rejection.
This is a catch-and-navigate, not a reimplementation.

## Backward compatibility

Today `.handler(fn)` returns a `fn()` spy (`export-mocks/start.ts:595-603`), so the symbol an app imports **is** a mock.
Every documented pattern depends on that: `myServerFn.mockResolvedValue(...)`, `expect(myServerFn).toHaveBeenCalledWith(...)`.
Plain delegation would hand back the real `createServerFn` callable instead, which has no mock methods, and would break every one of those stories.

Two of the three compatibility risks are therefore requirements on the implementation, not accepted costs.

**The export must stay a spy.**
Keep returning a `fn()` whose _default implementation_ runs the real chain, rather than returning the real callable.
Users who never mock get real middleware and validator behavior; users who call `mockResolvedValue` short-circuit exactly as they do today; call assertions keep working.
Fidelity is added only on the path that was previously a no-op.

**The default implementation must survive Storybook's automatic mock reset.**
The README already tells users to mock in `beforeEach` because it runs after that reset.
A reset that clears implementations would also clear the chain-running default, and the function would silently return `undefined` again.
This must be handled deliberately: it is the failure mode that passes unit tests and only shows up in a real Storybook session, so the phase needs a story-level check that a server function still runs its chain after a reset, not just a unit test.

**Middleware and validators genuinely start running, and that part is breaking.**
For calls a story does not mock, middleware side effects now fire and validators now reject input that previously passed unchecked.
An auth middleware that throws will newly fail stories that passed before.
Cookies change in the same way: `setCookie` followed by `getCookie` stops round-tripping, so a story asserting today's incorrect behavior breaks.

This last one is the intended correction rather than a defect, but it is still a behavior change for existing users and is treated as one: it needs a release note and an explicit docs callout, not silence.
It is also an argument for landing the delegation swap and the framework option in that order, so the change in default behavior is reviewable on its own.

## Documentation

A user-facing docs change is a deliverable of this phase, not a follow-up.
`docs/get-started/frameworks/tanstack-react.mdx` currently says handlers "are replaced with mock functions", which stops being the whole truth.
The page needs to state:

- The middleware chain and validator now execute for real in stories.
- Where the transport boundary sits, and that there is no server: the call never leaves the browser.
- What the framework option does, its `__mocks__` precondition, and when not to enable it.
- How to supply a handler stub when the option is off, with the existing mocking pattern.
- That mocking a server function still short-circuits the chain, so the documented `mockResolvedValue` pattern is unchanged.
- A callout for the breaking part: unmocked calls now run middleware and validators, so middleware side effects fire and invalid input is now rejected.

It slots beside the existing "Handling server-only dependencies" section, which already establishes the vocabulary.

## Verification

The five gauges are the acceptance test, and they are already written and already red.
Green on the `patched` channel means the mock reproduces what the Playwright twins measured against a real server.

Framework unit tests cover the pieces the gauges cannot isolate: the transport shim, the serializer round-trip (both its failure parity and its identity parity), the cookie request/response split, and the redirect catch.

One new instrument is added before its implementation: a gauge plus Playwright twin for a server function returning a `Response`, since nothing measures that today. That takes the phase 0 shape, so it is expected to be red until the branch that handles it lands.

Per the repository's ground rules, every fix lands with a test that failed first, and the failure is captured before the fix is applied.

## Risks

- **Chain execution reaches further into real TanStack code than the mock ever has.** A change in `executeMiddleware` upstream could move story behavior. This is the intended trade: delegation means inheriting upstream's behavior, including its changes. The gauges are what detect it.
- **The option's precondition is easy to get wrong.** An app enabling it with an unmocked `node:fs` import gets a build failure. The docs must state the precondition plainly, which is why documentation is scoped as a deliverable.
- **`__executeServer` depends on start context state** the mock currently keeps in two unsynced stores. Phase 2 supplies only what the call path reads; if that proves insufficient in implementation, the storage-context rework is a phase 3 candidate rather than a scope expansion here.
- **Global middleware does not run in stories, and this phase does not change that.** See the corrected note above: `getStartOptions` resolves to an untransformed dummy inside `node_modules`, so its middleware list is always empty. No gauge depends on it. An app relying on global middleware will see it skipped, which is worth stating in the documentation alongside the other limits.

## How faithful the transport is

Two decisions about the in-process transport, both settled 2026-08-03.

**It round-trips through TanStack's own serializer.**
The real transport serializes the payload with `toJSONAsync` and reads the result back with `fromCrossJSON`, using `getDefaultSerovalPlugins()` (`start-client-core/src/client-rpc/serverFnFetcher.ts:8,113-137`).
All three are reachable: `getDefaultSerovalPlugins` is a public export of the package entry (`src/index.tsx:117`), and `seroval` is already its dependency.
The in-process path does the same transform, minus the fetch and minus the frame protocol, which exists only to multiplex streams over the wire.

Skipping it was the cheaper option and was rejected, because it produces exactly the drift this suite exists to catch: a story could pass a function or a class instance and succeed where the real app rejects it. Round-tripping buys two properties that a plain in-process call cannot:

- **Failure parity.** A non-serializable payload throws in a story the way it would in the app.
- **Identity parity.** The story receives a copy, so it cannot mutate the object the handler still holds. A shared reference would let a story observe changes the real app never could.

**Known limit:** streamed and raw-stream returns travel over the frame protocol, which the in-process path does not reproduce. That divergence is documented rather than fixed here.

**`Response` returns bypass serialization, mirroring the real handler.**
The real server side branches on `unwrapped instanceof Response` and returns it raw (`start-server-core/src/server-functions-handler.ts:174`), signalled with the `X_TSS_RAW_RESPONSE` header constant, which is also a public export.
The in-process path takes the same branch.

Nothing currently measures this: no gauge and no Playwright twin covers a server function returning a `Response`. Per the roadmap's own ordering principle, instruments come before surgery, so **this phase adds that gauge and its twin before implementing the branch**, the same way phase 0 did for the behaviors phase 2 is fixing.

## Out of scope

- **Work package A, the navigation seam.** `By Link` stays red. It is not a fidelity fix but a product decision: the audit recommends "block and record via `onNavigate` everywhere", under which a story never navigates and the gauge is red by design, while conformance issue #1 sketches an opt-in `tanstack.router.navigation` parameter with spy, same-route and real modes. That decision needs its own design conversation, and issue #1 already rules that it ships last, on top of the fix stack. It also depends on upstream #35505, still open.
- **Storage-context rework (finding 23)**, beyond the two fields the call path reads.
- **`RouteOverrideOptions` widening** (`notFoundComponent`, `errorComponent`, `params`, `head`, `search`, and also `id` and `path`), carried over from phase 1 as its own single-bug change. Phase 1's intent audit settled the open question about it: the omissions were incidental rather than deliberate, narrowed by attrition across two commits with empty bodies, while the runtime is a blanket spread that accepts anything. The maintainers themselves later re-added `component` and called its absence a bug. So the widening is consistent with the runtime, the docs and their own precedent, and needs no further justification when it is written up.
- **Mirroring TanStack's parser plugin selection in the elimination plugin.** TanStack pairs its id regex with `getDefaultParserPluginsForFilename`, which enables `jsx` only for files that are not plain TypeScript; the framework hardcodes `['typescript', 'jsx']` with no `try`/`catch`, so an angle-bracket type assertion in a `.ts`, `.mts` or `.cts` file throws out of `transformSync`. This phase touches the elimination plugin for the handler carve-out, so the two are adjacent, but they are separate bugs and stay separate changes.
- **Leaf resolution via router-core (package D)** and **router option forwarding (package E)**. Both are verified findings with no failing gauge; they belong to a later phase where instruments come first.
