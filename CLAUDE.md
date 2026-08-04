# storybook-tanstack-conformance

Conformance suite measuring `@storybook/tanstack-react` against real TanStack Router/Start behavior. Eight apps, three channels, story suites plus Playwright twins.

## Hard rules

- NEVER file, comment on, or review upstream PRs or issues (storybookjs, TanStack, anywhere). The repository owner does that manually, with AI disclosure. This includes "helpful" replies; do not.
- `expectations.json` is machine-written: change it only via `node scripts/verify.mjs <channel> --update`, never by hand.
- README generated sections (between `<!-- generated:... -->` markers) only via `node scripts/docs.mjs`. Manual edits outside markers are fine.
- The `status` branch is CI-owned; never commit to it.
- Gauge stories assert what the REAL app does (proven by an e2e twin asserting the identical strings). Expected-failing gauges are instruments, not bugs; do not "fix" them by weakening assertions.

## Conventions

- CSF3 stories everywhere except `-csf4` suffixed apps (CSF factories); enforced by `scripts/assert-csf-modes.mjs`.
- New stories carry `tags: ["ai-generated"]`.
- Double quotes, semicolons (oxfmt); oxlint clean; no end-of-line comments; no em dashes in committed text; docs use one line per paragraph.
- Story files never become routes (`routeFileIgnorePattern: ".stories."` in `shared/vite.ts`).
- e2e clicks against SSR dev servers race hydration: wrap click+assert in the `await expect(async () => { ... }).toPass()` idiom, and keep retried interactions idempotent (see `e2e/start.spec.ts`).

## Workflow

- Fresh clone: run `npm install` then `npm test` BEFORE `npm run check` (typecheck needs the generated `routeTree.gen.ts` files).
- Channels: `node scripts/channel.mjs <main|next|patched>` then `npm install --prefer-online` (a stale packument cache can silently pin an old dist-tag). Restore with `git checkout -- apps package-lock.json && npm install`.
- Measure: `node scripts/conformance-report.mjs` (runs all 8 app suites, 6-10 minutes; if backgrounding it, verify the process actually exists). Then `node scripts/verify.mjs <channel>` to gate, `--update` to accept intended drift.
- Single app: `npm run test --workspace=apps/<name>`. e2e: `npx playwright test e2e/<name>.spec.ts`.
- Before any commit: `npm run check`.

## Where things live

- `docs/plans/`: the phased fix-in-flight roadmap for the framework; `docs/audits/`: the findings that drive it.
- Framework fix branches: `~/src/sbfork` (fork of storybookjs/storybook; branches `fix/tanstack-*`, pushed to the fork, NO PRs opened).
- `~/src/repro`: a real TanStack app used for occasional real-world validation; local-only repo, no remote.
