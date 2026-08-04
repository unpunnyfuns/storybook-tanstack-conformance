# storybook-tanstack-conformance

Story-level conformance suite for `@storybook/tanstack-react`, run against real applications covering the whole routing grid: TanStack Router and TanStack Start, each with file-based, code-based, and virtual routing. Every scenario is a story with a play function asserting on rendered output, so a framework regression shows up as red tests.

Each app is its own control: every route works when the app runs normally (`npm run dev` in the workspace). When the app works and its stories do not, the framework is the place to look.

### Router

<!-- generated:badges-router -->

| stories passing                  | `storybook@latest`                                                                                                                                                                            | `storybook@next`                                                                                                                                                                              | [`patched`](#pending-fixes)                                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| file-based                       | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router.json)                       | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router.json)                       | ![router](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router.json)                       |
| code-based                       | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-code.json)             | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-code.json)             | ![router-code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-code.json)             |
| virtual routes                   | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-virtual.json)       | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-virtual.json)       | ![router-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-virtual.json)       |
| app shell (root pathless layout) | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-shell.json)           | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-shell.json)           | ![router-shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-shell.json)           |
| CSF factories                    | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-csf4.json)             | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-csf4.json)             | ![router-csf4](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-csf4.json)             |
| route tree autoload              | ![router-autoload](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-autoload.json)     | ![router-autoload](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-autoload.json)     | ![router-autoload](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-autoload.json)     |
| route tree not connected         | ![router-standalone](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-router-standalone.json) | ![router-standalone](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-router-standalone.json) | ![router-standalone](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-router-standalone.json) |

<!-- generated:end -->

### Start

<!-- generated:badges-start -->

| stories passing | `storybook@latest`                                                                                                                                                                    | `storybook@next`                                                                                                                                                                      | [`patched`](#pending-fixes)                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| file-based      | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start.json)                 | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start.json)                 | ![start](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start.json)                 |
| virtual routes  | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-main-start-virtual.json) | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-next-start-virtual.json) | ![start-virtual](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-patched-start-virtual.json) |

<!-- generated:end -->

The file-based rows carry the deepest scenario coverage, so their counts include issues common to every routing mode. The thinner code-based and virtual rows simply do not exercise those common cases yet.

### Apps (pure TanStack, no Storybook)

Playwright end-to-end tests run each app as a real dev server, so the routes themselves are verified independently of Storybook.

<!-- generated:badges-e2e -->

| app e2e                          | **Router**                                                                                                                                                                                       | **Start**                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| file-based                       | ![router e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router.json)                       | ![start e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start.json)                 |
| code-based                       | ![router-code e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-code.json)             | n/a                                                                                                                                                                                      |
| virtual routes                   | ![router-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-virtual.json)       | ![start-virtual e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-start-virtual.json) |
| app shell (root pathless layout) | ![router-shell e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-shell.json)           | n/a                                                                                                                                                                                      |
| CSF factories                    | ![router-csf4 e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-csf4.json)             | n/a                                                                                                                                                                                      |
| route tree autoload              | ![router-autoload e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-autoload.json)     | n/a                                                                                                                                                                                      |
| route tree not connected         | ![router-standalone e2e](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Funpunnyfuns%2Fstorybook-tanstack-conformance%2Fstatus%2Fbadge-e2e-router-standalone.json) | n/a                                                                                                                                                                                      |

<!-- generated:end -->

## Workspaces

<!-- generated:workspaces -->

| App                      | Family | Routing / format                 | Stories |
| ------------------------ | ------ | -------------------------------- | ------- |
| `apps/router`            | Router | file-based                       | 41      |
| `apps/router-code`       | Router | code-based                       | 4       |
| `apps/router-virtual`    | Router | virtual routes                   | 3       |
| `apps/start`             | Start  | file-based                       | 47      |
| `apps/start-virtual`     | Start  | virtual routes                   | 3       |
| `apps/router-shell`      | Router | app shell (root pathless layout) | 4       |
| `apps/router-csf4`       | Router | CSF factories                    | 5       |
| `apps/router-autoload`   | Router | route tree autoload              | 1       |
| `apps/router-standalone` | Router | route tree not connected         | 4       |

112 stories total (from expectations.json, channel `main`).

<!-- generated:end -->

Each app exists for one shape the others cannot host. [docs/apps.md](docs/apps.md) explains what only each one can measure.

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

Per-app commands go through npm workspaces (`-w apps/<name>`); there are no per-app scripts at the root to keep in sync.

## Channels

Everything lives on one branch. Which framework build the suite measures is a channel, selected by rewriting the apps' dependency specs:

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

[docs/channels.md](docs/channels.md) covers why channels are not branches, and how CI publishes the badges above.

## Pending fixes

Fixes that have not yet landed upstream. The `patched` row above shows what `next` looks like once they do.

<!-- generated:fixes -->

| Fix                                                                                            | Scope  | Status | In `latest` | In `next` | Stories fixed |
| ---------------------------------------------------------------------------------------------- | ------ | ------ | ----------- | --------- | ------------- |
| [#35505](https://github.com/storybookjs/storybook/pull/35505) real link hrefs in the Link mock | common | open   | no          | no        | 1             |

<!-- generated:end -->

[docs/fixes.md](docs/fixes.md) covers how the `patched` tarball is built.

## Documentation

|                                                          |                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [docs/apps.md](docs/apps.md)                             | Every app, and the shape only it can measure                                                    |
| [docs/scenarios.md](docs/scenarios.md)                   | Every scenario asserted, common and Start-specific                                              |
| [docs/channels.md](docs/channels.md)                     | How the three channels work                                                                     |
| [docs/fixes.md](docs/fixes.md)                           | How the patched build is produced                                                               |
| [docs/plans](docs/plans/README.md)                       | The phased roadmap for aligning the framework                                                   |
| [docs/audits](docs/audits/2026-08-01-framework-audit.md) | The audit driving the work, and [later findings](docs/audits/2026-08-05-post-audit-findings.md) |

The framework is being aligned with real TanStack behavior incrementally, and the plans and audits are public for external review. Corrections and challenges are welcome as issues on this repo.

## Disclosure

Stories and analysis were developed with AI assistance (Claude Code) and are tagged `ai-generated`; the suite is maintained and verified by a human.
