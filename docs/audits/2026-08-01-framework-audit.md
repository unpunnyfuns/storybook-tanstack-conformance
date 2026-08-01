# @storybook/tanstack-react framework audit (2026-08-01)

Full-framework audit of `upstream/next` (~4,400 lines) against the real TanStack implementation installed in the conformance repo. Four parallel read-only audits: routing core, Start export mocks, Vite plugins, integration layer.

Ground truth versions: `@tanstack/router-core@1.171.15`, `@tanstack/react-router@1.170.18`, `@tanstack/react-start@1.168.28`, `@tanstack/start-plugin-core@1.171.20`, `@tanstack/start-client-core@1.170.14`.

Status legend: **[verified]** = reproduced by executing the framework's code against the real packages during the audit. **[needs-probe]** = code-read evidence only, reproduce before filing anything upstream.

Known findings excluded (already established): `isPathlessFileRouteId` trailing-slash defect (#35660 territory), route-tree auto-connect gap, nested standalone index 404, CSF4 previewAnnotations drop in builder-vite.

## Tier 1: story renders wrong thing or crashes

1. **`createStart()` returns `{}`** [needs-probe, high confidence] `export-mocks/start.ts:645`. Real returns `{ getOptions, createMiddleware }`. Any app declaring global middleware via the current documented API crashes at module eval with `startInstance.createMiddleware is not a function`, taking down every story that imports the app's `start.ts`.

2. **Lazy routes clobber the injected story** [verified] `routing/duplicate-tree.ts:100-102` + `decorator.tsx:176`. `cloneChild` copies `lazyFn`; when the match loads, router-core `Object.assign`s the lazy chunk's options over `route.options` (`load-matches.js:613-617`), so the real component replaces the story. The existing test asserts exactly this destructive behavior as correct ("carries lazy route bindings onto clones").

3. **Server-code-elimination escapes execute server code in the browser** [verified, family]. The mock builder runs `.handler(fn)` bodies client-side, so every detection miss is live execution, not bundle bloat. Verified escapes vs `start-plugin-core`'s compiler:
   - builder imported from a shared lib, `.handler()` called in the route file (`server-code-elimination.ts:27,167`; real compiler has a `.handler(` pattern + cross-module kind resolution)
   - `import * as Start` namespace imports (`:259,301`)
   - `as` / `satisfies` / `!` / parens anywhere in the chain (no `unwrapExpression`; router-utils has one)
   - id filter `/\.tsx?$/` skips `.js/.jsx/.mjs` and any id with a Vite query (`?t=`, `?v=`, `?tsr-split=`); the router code-splitter's `?tsr-split=` ids bypass entirely because `preset.ts:54` only strips plugins named `tanstack-start*`
   - factory aliased through a variable or renamed barrel export (`:289`)

4. **Mock server-fn builder discards middleware and validator** [needs-probe, high] `start.ts:583-605`. `.middleware()` throws the array away, `.validator()` returns a fresh builder. Handler ctx has no `context`/`signal`/`method`; zod coercions never run; invalid input never throws. Stories pass on data the real server rejects. Partially masked for `.tsx` files by the elimination plugin's spy rewrite, so `.js`/`.jsx` and node_modules sources hit it.

5. **Mock `createFileRoute` passes `isRoot: false` inside options** [verified] `export-mocks/react-router.ts:93-97`. Real sets it as an instance property post-construction. Routes built the way `routeTree.gen.ts` builds them (bare construct, then `.update({getParentRoute})`) end up `isRoot === true` and are never matchable: every URL 404s the moment anything uses the app's own tree directly. Currently masked only because `duplicateRouteTree` rebuilds nodes with `getParentRoute` at construction.

6. **`createIsomorphicFn().client(a).server(b)` discards the client impl** [verified] `server-code-elimination.ts:211-217`. Only `.server().client()` order survives; the real compiler is order-independent. Both existing tests use the surviving order.

## Tier 2: navigation seam inconsistencies

7. **`useNavigate`/`useRouter` are spied but real** [needs-probe, high] `export-mocks/react-router.ts:32-33`. Imperative navigation actually navigates (story unmounts) and never records to `onNavigate`, the exact opposite of `Link`/`Navigate` which block and record. `useBlocker` can never fire because `Link` bypasses the router history.

8. **`useServerFn` drops redirect handling** [needs-probe, high] `start.ts:564-571`. Real catches `isRedirect(err)` and navigates; mock is a bare passthrough, so a server fn throwing `redirect()` becomes an unhandled rejection and `onNavigate` records nothing.

9. **Mock `Link` ignores `params`/`search` and leaks props to the DOM** [needs-probe, high] `react-router.ts:57-81`. `<Link to="/posts/$postId" params={{postId:'1'}}>` renders `href="/posts/$postId"`; object-valued `params`/`activeProps` spread onto the anchor; `activeProps`/`aria-current` never applied. Real `useLinkProps` builds href via `router.buildLocation`.

10. **Two disagreeing `Navigate` mocks, one using Storybook addon hooks** [needs-probe, high] `react-router.ts:6,49-55` uses `storybook/internal/preview-api` `useEffect`, which throws ("preview hooks can only be called inside decorators...") when `Navigate` mounts from a post-click re-render. `start.ts:629` implements the same component with `React.useEffect`.

## Tier 3: leaf resolution and router construction drift

11. **Story leaf chosen by mount-path string length, router matches by specificity** [verified] `duplicate-tree.ts:253-271`. With `params` supplied, `/users/$id` vs `/$section/$slug` interpolating to the same URL: story injected on the longer string, router matches the more specific route, story never renders. Real ranking: `isFrameMoreSpecific` / `segmentScore` in `new-process-route-tree.js`.

12. **Synthetic index shadowed by the app's real index, order-dependent** [verified] `decorator.tsx:139-163`. `ensureMatchableLeaf`'s `path:'/'` child collides with the app's root index; the trie's single `index` slot is last-write-wins while `node.route` is first-write-wins. Declaration order decides whether the story or the home page renders. The adjacent test hardcodes the passing order.

13. **Explicit `path` never normalized** [verified] `decorator.tsx:94-99`. Trailing slash (`'/about/'`) matches no candidate and yields zero matches under the default `trailingSlash: 'never'`. Case variants (`'/About'`) likewise fall through to an arbitrary fallback route while the real router matches case-insensitively by default [case item needs-probe at story level].

14. **Missing `params` interpolates literal `"undefined"`** [verified] `decorator.tsx:101-104`. `interpolatePath`'s `isMissingParams` flag is discarded; URL becomes `/users/undefined`.

15. **App `createRouter` options dropped wholesale** [verified] `decorator.tsx:115-125`. `caseSensitive`, `basepath`, `trailingSlash`, `parseSearch`/`stringifySearch` (most consequential: custom search encodings break `validateSearch`), `routeMasks`, `defaultPendingComponent`, `Wrap`/`InnerWrap` all silently lost.

16. **Branch 2 mutates the user's module-singleton route object** [verified] `decorator.tsx:230-231` + `duplicate-tree.ts:53-61,132`. Re-parents the live `Route`, permanently; second mount of the same story takes a different `resolveTree` branch than the first; leaks across stories sharing a route import; mutations happen during render inside `useMemo` (StrictMode runs them twice).

## Tier 4: interception and stubbing holes

17. **Interception specifier coverage** [needs-probe, med-high] `module-interception.ts:4-9,41,50-73`. (a) Start matched by exact string so real subpaths (`/hydration`, `/client-rpc`, `/server-only`, ...) escape to real modules while router subpaths are prefix-matched (inconsistent both ways: router subpath interception also over-reaches, redirecting real `./ssr/*` subpaths to a mock missing their exports). (b) `@tanstack/start-client-core` never intercepted although the mock overrides its `createServerFn`. (c) `id.includes('server-entry')` substring-matches user files like `server-entry-badge.tsx` and replaces them with the Start mock. (d) `optimizeDeps.exclude` omits `@tanstack/react-router`, a dual-instance hazard (mock served from source, real router prebundled).

18. **Invented, name-based `server:` strip** [verified] `server-code-elimination.ts:339-380`. Deletes the `server` property from any `createRoute`/`createFileRoute` call by bare name, including unrelated libraries. No such AST transform exists upstream; Start prunes server-only routes from the client tree instead.

19. **`.validator()` never stripped from bundles** [verified] `server-code-elimination.ts:187`. Only deprecated `.inputValidator()` is; server-side schema imports survive into the browser bundle.

20. **`server-only-stub` gaps, zero tests** [needs-probe, med-high] `server-only-stub.ts:5,60,69`. No support for TanStack's `server-only` marker-import convention; `export * from` and destructured exports produce no stub exports; parse failure swallowed into a silently empty stub.

## Tier 5: request/response mock fidelity

21. **`setResponseHeaders` replaces instead of merges** [needs-probe] `start.ts:383-385`. Wipes prior `Set-Cookie`; real iterates and `.set()`s onto existing headers.

22. **`setCookie` readable back via `getCookie` in-request** [needs-probe] `start.ts:449-458`. Real cookies read from the request header only; mock also omits the `path: '/'` default and name de-dupe. Stories can assert values the real server never returns.

23. **Storage context detached from request state** [needs-probe] `start-storage-context.ts:13-46`. Two never-synced stores; `getStartContext().request` is a fresh `new Request('http://localhost/')` per call even when `getRequest()` is correct; per-call `executedRequestMiddlewares` defeats de-dupe; global-symbol save/restore is not async-safe like `AsyncLocalStorage`.

24. Smaller drifts: `notFound()` throws a plain Error instead of returning a `{isNotFound}` payload (`start.ts:640`); `.options` is a method not the resolved options object, no `.url`/`.method` on the fetcher (`:578`); `getValidatedQuery` returns the standard-schema wrapper and never throws (`:552-554`); `setResponseStatus(undefined, 'text')` clears a set code (`:431`); `useSession` accepts any password, `save()` no-ops (`:487`); mock surface is a superset of the real package (stories can import `getCookie` from `@tanstack/react-start` and pass while the app build fails); `start.ts:7`'s `export * from '@tanstack/react-start'` self-resolves due to a missing importer guard; `_useMatch`/`_useMatches` etc. imported for spying but never wrapped.

## Tier 6: integration layer

25. **Dead `optimizeDeps` export in `preview.tsx:26`** [needs-probe, high]. Wrong field name (builder-vite reads preset-level `optimizeViteDeps`) and wrong module type; devtools packages never pre-bundled, causing mid-session re-optimize reloads.

26. **Override types**: `RouteTreeOverrides` cannot express the runtime-supported `__root__` key (`routing/types.ts:146-148` vs `duplicate-tree.ts:136`); `RouteOverrideOptions` artificially omits `params`/`head`/`search` the runtime merge accepts; neither type is exported from the package entry (`index.ts:29-35`).

27. **Docs vs peer deps**: docs page says React >= 18 / Vite >= 7; package.json allows React 16.8+ / Vite 5+. One of them is wrong.

28. **`@tanstack/router-core` is a mandatory peer** users never install directly (transitive dep of react-router); strict package managers warn.

29. **No opt-out for Start plugin stripping / interception** in `FrameworkOptions` (`preset.ts:33-64`).

30. **Escaped-segment misclassification** [needs-probe, med-low] `path-utils.ts`. `[_]private.tsx` (literal `_private` URL segment) treated as a pathless layout; the current generator carries per-segment escape metadata the framework's copied helpers predate.

## Cross-cutting themes

1. **Hand-reimplemented TanStack semantics drift.** The mocks and the leaf resolver re-derive behavior (href building, matching, cookie semantics, builder chains) that router-core/start-client-core already export. Every re-derivation is a drift point. Where possible, delegate to the real implementation (e.g. `router.buildLocation` for Link hrefs, `processRouteTree`/`matchRoute` for leaf ranking, real `createServerFn` execution pipeline with a mock transport).
2. **The elimination plugin is a weaker rewrite of `start-plugin-core`'s compiler.** The real compiler's building blocks (`unwrapExpression`, `cleanId`, detection patterns, cross-module kind resolution) are published in the installed packages. Port or reuse them rather than maintaining a parallel heuristic set.
3. **Tests assert the implementation's own bookkeeping, not router-observable behavior.** `join(',')` + `toContain` substring traps; asserting `Route.options.path` instead of matched ids; the plugin test helper bypassing `transform.filter`; tests that hardcode the one ordering/chaining order that works. The 19-line `start.test.ts` passes because of the validator bug, not despite it.
4. **Silent fallbacks hide failures.** Unmatched explicit `path` silently injects on an arbitrary route; parse errors become empty stubs; missing params become `"undefined"` URLs. Each should warn or throw.
5. **Navigation seam is incoherent.** `Link`/`Navigate` block + record; `useNavigate`/`useRouter` are real; `useBlocker` can never fire. Pick one contract (block + record via `onNavigate`) and apply it everywhere.

## Candidate work packages

- **A. Navigation seam unification**: one `Navigate` (React.useEffect), `useNavigate` records + blocks, Link builds real hrefs via `buildLocation`, strips non-DOM props. Findings 7, 8, 9, 10.
- **B. Server-fn mock fidelity**: run validator + middleware chain (real `execValidator` semantics), `createStart` instance shape, ctx with `context`/`signal`/`method`. Findings 1, 4, 8, 24.
- **C. Elimination hardening**: reuse router-utils `unwrapExpression` + `cleanId`-style id handling, add `.handler(` pattern + namespace/default import support, widen extension filter, strip `.validator()`, gate or remove the invented `server:` strip behind import-source verification. Findings 3, 6, 18, 19.
- **D. Leaf resolution via the router**: replace string-length ranking with router-core matching; normalize incoming `path` (trailing slash, case); surface `isMissingParams` as an error. Findings 11, 13, 14.
- **E. Router option forwarding + no mutation**: accept/forward app router options (`parseSearch`, `basepath`, `caseSensitive`, ...); clone instead of mutating user route objects in branch 2. Findings 15, 16.
- **F. Interception correctness**: consistent prefix matching, add `start-client-core`, exact-segment `server-entry` match, `optimizeDeps` exclude react-router, importer guard on the Start star-export. Findings 17, 24.
- **G. Types and API surface**: export override types, allow `__root__`, widen `RouteOverrideOptions`, fix `optimizeViteDeps`, align docs/peers, opt-out flag. Findings 25-29.
- **H. Test strategy**: behavior-level assertions (exact matched-id arrays against a real router), negative tests (foreign `createRoute` untouched), filter-inclusive plugin tests, chain-order matrices, and new conformance apps (lazy routes, Start middleware/validator, imperative navigation).

## Probe status

Verified during audit (agents executed real code): findings 2, 3 (all five escapes), 5, 6, 11, 12, 13 (trailing slash), 14, 15, 16, 18, 19.
Still needing a story-level or runtime probe before any upstream filing: 1, 4, 7, 8, 9, 10, 13 (case), 17, 20, 21, 22, 23, 25, 30.
