# Phase 3 design: one navigation contract

**Goal:** make every navigation path in the framework behave the same way, and make which way it behaves a decision the story author takes deliberately.

**Source:** [the framework audit](../audits/2026-08-01-framework-audit.md), Tier 2 finding 7 and the remaining half of finding 10, plus cross-cutting theme 5.

## The problem

The framework has four ways to navigate and they disagree with each other.

|                        | records to `onNavigate` | navigates |
| ---------------------- | ----------------------- | --------- |
| `Link`                 | yes                     | no        |
| `Navigate`             | yes                     | no        |
| `useNavigate`          | no                      | yes       |
| `useRouter().navigate` | no                      | yes       |

A story author cannot predict what a navigation does without knowing which API produced it.
Asserting on the `onNavigate` spy silently misses imperative navigation, because `useNavigate` records nothing.
`useBlocker` can never fire at all, because `Link` calls `preventDefault()` and nothing reaches router history.

## Why the current behavior exists

`Link` and `Navigate` block on purpose.
The seam is documented in `export-mocks/spies.ts`: navigation is recorded rather than performed so the story stays on screen instead of replacing itself with another route.
That is a reasonable goal and this design keeps it as the default.

`useNavigate` and `useRouter` are `fn(_useNavigate)` and `fn(_useRouter)`, which spy on the real hooks without changing them.
That looks like an oversight rather than a decision: they were wrapped for spy naming, and the navigation behavior came along with the real implementation.

## What the instrument already shows

`apps/router/src/navigation.stories.tsx` mounts one page with all three triggers and asserts each lands on `/nav-target`.
The e2e twin in `e2e/router.spec.ts` proves the real app does exactly that.

On every channel, including the stock ones, `By Hook` passes while `By Link` and `By Component` fail.

That is worth stating plainly, because it contradicts the audit's own recommendation to block everywhere.
Real navigation through `useNavigate` does not break a story: in tree mode the whole route tree is mounted, so navigating lands on a real route inside the same router and the canvas renders the target.
The premise that a navigating story would unmount itself is already disproven by the one path that does not block.

`Redirect Navigates` in `apps/start` fails for the same reason one layer down.
Its route redirects to `/redirector?done=yes` and reads `done` from search params, so it only turns green if navigation actually happens.
Phase 2 made the redirect reachable and correctly recorded, but recording is not navigating.

## The contract

Two switches, separated.

**Recording is unconditional.**
Every navigation path calls `onNavigate`, including `useNavigate` and `useRouter().navigate`.
This is purely additive: no existing assertion can break, and imperative navigation stops being invisible to the spy.

**Navigation is opt-in and symmetric.**
Off by default: `Link`, `Navigate`, `useNavigate` and `useRouter().navigate` all record and stay put.
On: all four navigate for real and record.

Both states are internally consistent, which is what finding 7 asks for.
Off means nothing navigates, rather than "nothing navigates except the one path that does".
Turning it on also revives `useBlocker`, which starts receiving real history transitions.

## The spy no story can reach

Recording is only worth anything if a story can read the recording, and today it cannot.

`onNavigate` is exported from `export-mocks/spies.ts` and re-exported by nothing.
Not `react-router.ts`, not `start.ts`, not `index.ts`, and there is no `spies` entry in the package's `exports` map.

The docs tell users to assert on it twice: "Assert on the spy there rather than on a rejection", and "Import from this module when you need direct access to the mock APIs (for example, to assert against navigation spies in tests)".
Neither is possible.

This also explains something the conformance suite shows and nobody had explained: across more than seventy stories, not one asserts on `onNavigate`.
That looked like a coverage gap. It was an impossibility.

So this phase ships the export first, as its own deliverable on its own branch, before any of the contract work.
It goes out as a new subpath, `@storybook/tanstack-react/spies`, pointing at `export-mocks/spies.ts`.

The subpath rather than a re-export from `react-router.ts` is deliberate.
That file is the redirect target for `@tanstack/react-router`, so re-exporting the spy there would make `import { onNavigate } from '@tanstack/react-router'` resolve, which is surface no real app has and the defect class that blocked a phase 2 task.
`spies.ts` is not a redirect target, so exporting from it adds nothing to any real TanStack specifier.
It is also the honest boundary: the spy is a Storybook concept, not a router API.

## Where the switch lives

A story parameter, `parameters.tanstack.router.navigate`, defaulting to `false`.

Navigation is a per-story concern in a way the phase 2 framework option is not.
One story should be able to exercise a link while its neighbours in the same file stay put.
A project-wide flag would make every story navigable, which is the unsafe default this design exists to avoid, and in this suite it would mean flipping all of `apps/router` to serve three gauges.

`RouterParameters` in `routing/types.ts` is already the home for router-scoped story parameters, and `parameters.tanstack.start.context` from phase 2 set the precedent for a per-story escape hatch.

## How the flag reaches the mocks

The mocks are modules and the parameter lives on story context, so something has to carry it across.

Phase 2 solved this shape already: the decorator writes a `Symbol.for(...)` keyed global before rendering and clears it per story, and the mock reads it.
`export-mocks/start-storage-context.ts` and `story-start-context.ts` are the working examples.

The symbol stays module-private.
Adding an export to a file under `export-mocks/` adds public API, because `plugins/module-interception.ts` redirects real TanStack specifiers to those files, and a phase 2 task was blocked for exactly that.

## Scope boundary on `useRouter`

`useNavigate` returns a function, so wrapping it is direct.

`useRouter` returns the whole router, and a story can reach `router.navigate`, `router.history.push`, `router.buildLocation` and more.
This design wraps `router.navigate` through a shallow proxy and leaves the rest real, documented as such.

Proxying the full router surface is a much larger change with its own drift risk, and nothing currently measures it.
If a gauge later shows `router.history` mattering, that is its own work.

## Mock surface cleanup

`export-mocks/start.ts` defines its own `Link` and `Navigate`.
They are deleted rather than deduplicated.

The real `@tanstack/react-start` exports only `useServerFn` plus `export * from "@tanstack/start-client-core"`.
It exports no `Link` and no `Navigate`, so these are surface no real app can import.

The copies are also the pre-phase-1 versions: no `href` fallback, and no de-duplication ref, so they fire twice under StrictMode where the corrected `react-router.ts` version fires once.
Nothing in the conformance apps imports them.

This closes the remaining half of finding 10 and shrinks the mock toward the real package instead of maintaining two answers to the same question.

## What this phase does not cover

Finding 8, `useServerFn` redirect handling, landed in phase 2.

Finding 9, `Link` ignoring `params` and leaking props to the DOM, is already fixed on the `patched` channel: the `Link Hrefs` gauge passes there and fails on `main` and `next`, which is the pending upstream PR #35505 doing its job.

Finding 10's crash half, the `storybook/internal/preview-api` hook that threw on post-click remounts, landed in phase 1.

## Breaking changes

`useNavigate` and `useRouter().navigate` stop navigating by default.

**This breaks a documented pattern, deliberately.**
The framework docs say so in two places: "Automatically mock `@tanstack/react-router` so navigation hooks work in stories" and "keeps hooks such as `useNavigate()` ... available in stories".
Both lines need updating in this phase, or the docs will teach something the framework no longer does.

It is also an exercised pattern, not a theoretical one.
The `Pagination` story in `apps/router` and again in `apps/start` clicks a Next button and asserts `Page 2` becomes visible, which only passes if navigation actually happens.
`By Hook` in `apps/router/src/navigation.stories.tsx` is the third.
All three need `parameters.tanstack.router.navigate: true` in this phase.

The roadmap's ground rules say an impact that breaks a documented pattern gets designed out rather than shipped.
This one is shipped instead, as a deliberate exception taken with the evidence in hand, because designing it out means either abandoning symmetry or defaulting navigation on.
Defaulting on would silently start navigating every story that clicks a `Link` today, which is a larger and less visible blast radius than the one accepted here.
The framework is early enough that the smaller, louder break is the better trade.

It needs a release note and a docs callout.

A codemod can help but cannot finish the job.
It can find stories whose component or route reaches `useNavigate` and add the parameter, which covers the common case where a story uses either imperative navigation or `Link` but not both.
It cannot be a behavior-preserving transform in general, precisely because the switch is symmetric: setting it to `true` in a story that uses both restores the hook's navigation and simultaneously starts navigating that story's links.
Ship it as a migration aid that annotates for review, not as a guaranteed-correct rewrite.

In exchange, both start recording to `onNavigate`, which they never did.
Any story that already asserts on the spy keeps working, and gains coverage of imperative navigation it could not previously see.

`Link` and `Navigate` are unchanged by default, so stories relying on them staying put are unaffected.

Deleting `Link` and `Navigate` from the Start mock is a breaking change only for code importing them from `@tanstack/react-start`, which no real app can do, because the real package does not export them.

## Verification

`By Link`, `By Component` and `Redirect Navigates` set the new parameter and go green, taking `patched` to 107 of 107.

`By Hook` also sets it.
That is the honest cost of the change: it passes today only because the seam is inconsistent.

So do the two `Pagination` stories, in `apps/router` and `apps/start`.
They are the reason the breaking change is real rather than theoretical, and they are the migration this phase performs on itself.
Their totals do not move, but the diff shows what every affected user will have to do.

Two gauges are missing and this phase adds them, because otherwise the default path ships untested:

- with the flag off, a clicked `Link` records on the spy and the canvas does not change
- with the flag off, `useNavigate` records on the spy and the canvas does not change

Both assert framework behavior rather than real-app behavior, so neither needs an e2e twin.
The existing trio do assert real-app behavior and already have twins in `e2e/router.spec.ts`.

Both also depend on the spy export landing first, since neither can be written until a story can import `onNavigate`.
That dependency is why the export is task 1 rather than a tidy-up at the end.

`onNavigate` accumulates calls across stories in a file, because Storybook's `clearMocks` does not reach a module-scope `fn()` from `storybook/test`.
Phase 2 hit this in the framework's own suite. Every new gauge asserting on the spy clears it first.

## Risks

A story bound to a single route rather than a tree, with navigation on, can navigate to a route that is not mounted.
Real TanStack renders a not-found in that situation and so will the story, which is honest but may surprise.
Tree mode is the answer for authors who want working navigation, and the existing gauges are already set up that way.

`useBlocker` becoming functional is a behavior change for anyone who wrote a story around it never firing.
That seems unlikely to exist, since a blocker that never fires has nothing to assert.
