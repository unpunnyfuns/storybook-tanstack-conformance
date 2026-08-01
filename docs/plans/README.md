# Fix-in-flight roadmap for @storybook/tanstack-react

This directory holds the public plans for incrementally aligning `@storybook/tanstack-react` with real TanStack Router and TanStack Start behavior. The plans are published here for external review: if you maintain or use either project and see a wrong assumption, an issue or PR against this repo is welcome.

Source material: [the framework audit](../audits/2026-08-01-framework-audit.md), a file-by-file comparison of the framework (Storybook `next` branch) against the installed TanStack packages. Thirty findings, seventeen of them verified by executing the framework's code against the real packages.

## Strategy

The framework is in production use, so it gets fixed in flight: the smallest possible changes, over many steps, each independently shippable and revertible. The ordering principle is instruments before surgery. This conformance suite is the flight instrument panel: every app runs the same assertions in Storybook and in the real app (Playwright against a real dev server), so a claim about "what the real app does" is measured, not assumed.

| Phase | Where          | What                                                                                                                                                                                                                                                                                                                | Plan                                         | Status                |
| ----- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------- |
| 0     | this repo      | Instruments: gauge stories and e2e for the unmeasured findings (server-fn semantics, createStart, redirects, navigation seam)                                                                                                                                                                                       | [phase 0](2026-08-01-phase-0-instruments.md) | measured (2026-08-01) |
| 1     | storybook fork | Small fixes: eight independent, test-first patches, each a few lines (validator stripping, file-id filter, Navigate crash, createStart shape, dead export, type exports, missing-params warning, isomorphic order)                                                                                                  | [phase 1](2026-08-01-phase-1-small-fixes.md) | planned               |
| 2     | storybook fork | Delegation swaps: replace hand-reimplemented semantics with the real TanStack building blocks behind existing signatures (`buildLocation` for Link hrefs, router-core matching for story-leaf selection, `unwrapExpression`/`cleanId` in the eliminator, real validator/middleware execution in the server-fn mock) | planned after phase 0/1 data                 | not started           |
| 3     | storybook fork | Retirement: forward app router options instead of rebuilding, stop mutating user route objects, drop transforms with no upstream counterpart                                                                                                                                                                        | planned after phase 2                        | not started           |

Phases 2 and 3 get their own plan documents once the phase 0 instruments have measured which behaviors are actually broken per channel; writing detailed plans for them now would bake in assumptions the instruments exist to test.

## Ground rules

- Every gauge story asserts the behavior of the real running app (proven by a matching Playwright test), not the current behavior of the mock. A gauge that fails in Storybook is the instrument working.
- Every upstream fix lands with a test that failed before the fix, and the failure is captured before the fix is applied.
- Fixes are staged through this suite's `patched` channel before any upstream submission.
- Upstream pull requests are filed manually by the repository owner, never automatically.
