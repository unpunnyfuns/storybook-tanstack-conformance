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

A story that calls either and then asserts something about the destination will fail until it sets `parameters.tanstack.router.navigate: true`.
This is the intended correction rather than an accident: the whole point is that "off" means nothing navigates.
It needs a release note and a docs callout.

In exchange, both start recording to `onNavigate`, which they never did.
Any story that already asserts on the spy keeps working, and gains coverage of imperative navigation it could not previously see.

`Link` and `Navigate` are unchanged by default, so stories relying on them staying put are unaffected.

Deleting `Link` and `Navigate` from the Start mock is a breaking change only for code importing them from `@tanstack/react-start`, which no real app can do, because the real package does not export them.

## Verification

`By Link`, `By Component` and `Redirect Navigates` set the new parameter and go green, taking `patched` to 107 of 107.

`By Hook` also sets it.
That is the honest cost of the change: it passes today only because the seam is inconsistent.

Two gauges are missing and this phase adds them, because otherwise the default path ships untested:

- with the flag off, a clicked `Link` records on the spy and the canvas does not change
- with the flag off, `useNavigate` records on the spy and the canvas does not change

Both assert framework behavior rather than real-app behavior, so neither needs an e2e twin.
The existing trio do assert real-app behavior and already have twins in `e2e/router.spec.ts`.

## Risks

A story bound to a single route rather than a tree, with navigation on, can navigate to a route that is not mounted.
Real TanStack renders a not-found in that situation and so will the story, which is honest but may surprise.
Tree mode is the answer for authors who want working navigation, and the existing gauges are already set up that way.

`useBlocker` becoming functional is a behavior change for anyone who wrote a story around it never firing.
That seems unlikely to exist, since a blocker that never fires has nothing to assert.
