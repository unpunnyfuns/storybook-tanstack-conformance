# Fix-in-flight roadmap for @storybook/tanstack-react

This directory holds the public plans for incrementally aligning `@storybook/tanstack-react` with real TanStack Router and TanStack Start behavior. The plans are published here for external review: if you maintain or use either project and see a wrong assumption, an issue or PR against this repo is welcome.

Source material: [the framework audit](../audits/2026-08-01-framework-audit.md), a file-by-file comparison of the framework (Storybook `next` branch) against the installed TanStack packages. Thirty findings, seventeen of them verified by executing the framework's code against the real packages.

Findings that surfaced later, from building instruments rather than reading code, are collected in [post-audit findings](../audits/2026-08-05-post-audit-findings.md).

## Strategy

The framework is in production use, so it gets fixed in flight: the smallest possible changes, over many steps, each independently shippable and revertible. The ordering principle is instruments before surgery. This conformance suite is the flight instrument panel: every app runs the same assertions in Storybook and in the real app (Playwright against a real dev server), so a claim about "what the real app does" is measured, not assumed.

| Phase | Where          | What                                                                                                                                                                                                                                                                                                         | Plan                                         | Status                 |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ---------------------- |
| 0     | this repo      | Instruments: gauge stories and e2e for the unmeasured findings (server-fn semantics, createStart, redirects, navigation seam)                                                                                                                                                                                | retired, see git history                     | measured (2026-08-01)  |
| 1     | storybook fork | Small fixes: nine independent, test-first branches (validator stripping, file-id filter, Navigate crash, createStart shape, dead export, type exports, missing-params warning, isomorphic order), plus connecting the app's generated route tree so file routes reach stories with their id, path and parent | [phase 1](2026-08-01-phase-1-small-fixes.md) | composed, no PRs filed |
| 2     | storybook fork | Server-function fidelity by delegation: the `createServerFn` mock wraps the real one and swaps the fetch transport for an in-process call, so the middleware chain, validator, context merging and redirect parsing all come from real TanStack code instead of being reimplemented                          | [design](2026-08-02-phase-2-design.md)       | shipped to `patched`   |
| 3     | storybook fork | One navigation contract: recording to `onNavigate` becomes unconditional, navigating becomes an opt-in story parameter that governs all four paths symmetrically, and the Start mock stops shipping its own `Link` and `Navigate`                                                                            | [design](2026-08-03-phase-3-design.md)       | shipped to `patched`   |
| 4     | storybook fork | Deference: forward the app's `createRouter` options instead of rebuilding them, and stop permanently mutating the user's route objects                                                                                                                                                                       | needs instruments first                      | not started            |

Each phase gets its own document only once the instruments have measured what is actually broken, so that no plan bakes in an assumption the gauges exist to test. Phase 2 was designed against five gauges that were red on all three channels, phase 3 against three; all eight are green on `patched` now.

The step-by-step implementation plans for the phases that have shipped are retired once their work lands. They were written to be executed rather than read, they were the bulk of this directory, and git keeps them. What survives is the design document for each phase, which records why a decision went the way it did, and this table. Phase 1 keeps its plan for now because its branches are composed but not yet proposed upstream.

Phase 3 and phase 4 were swapped on 2026-08-03. The navigation seam went first because it was the only remaining work with live instruments: three gauges red on every channel, and the only thing then standing between `patched` and a clean sweep. Phase 4 has no gauge coverage at all, and cannot get any until an app actually configures the router options that finding 15 says are dropped, so it opens with instrument work rather than fixes. "Retirement" was also a poor name for it; it means retiring the framework's own reimplementations in favour of forwarding to the real router, which is the same move phase 2 made for server functions.

## Findings outside the phases

Not every finding waits for a phase. Instrument work turns some up mid-flight, and where the fix is small it lands on its own branch. This table is where those stand, and it is the only place any finding's status is tracked: the audits record what was measured on their date and are not updated afterwards.

| Finding                                                                                             | Branch                            | Status                    |
| --------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------- |
| [Story `path` rejects the `to` form of a nested index](../audits/2026-08-05-post-audit-findings.md) | `fix/tanstack-to-form-story-path` | on `patched`, no PR filed |

## Ground rules

- Every gauge story asserts the behavior of the real running app (proven by a matching Playwright test), not the current behavior of the mock. A gauge that fails in Storybook is the instrument working.
- Every upstream fix lands with a test that failed before the fix, and the failure is captured before the fix is applied.
- Every change to existing behavior establishes why that behavior exists before replacing it. Read the commit that introduced it and the real TanStack implementation it stands in for, in full. Odd-looking code is a claim that something was once true; the job is to find out whether it still is. When mirroring a real implementation, mirror all of it, including its guards: the `Navigate` mock was corrected to use React's own effect, which was right, but the first attempt omitted the de-duplication ref the real component uses and so fired its spy twice under StrictMode where the real one fires once.
- Every plan states what it breaks for existing users, before it is written up rather than when someone asks. The framework is in production use, so a change that alters an imported symbol's shape, starts executing something that silently no-opped, or contradicts what the docs teach is a finding the plan owes its readers. Impacts that break a documented pattern are requirements on the implementation and get designed out; impacts that are the intended correction stay, and earn a release note and a docs callout.
- Status lives in exactly one place, and that place is this document. Audits record what was measured on their date and are never revised; findings do not carry a "fixed" marker, and plans do not restate where a phase stands. A fact kept in two documents goes stale in one of them, and the stale copy is the one someone reads.
- Fixes are staged through this suite's `patched` channel before any upstream submission.
- Upstream pull requests are filed manually by the repository owner, never automatically.
