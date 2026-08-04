# Findings after the framework audit (from 2026-08-05)

Framework findings surfaced after [the 2026-08-01 audit](2026-08-01-framework-audit.md), by building instruments and running them rather than by reading code.

Who this is for, and what it is not: it is written for whoever decides what to fix next, and for anyone who wants to challenge a claim made here about real TanStack behavior. It records what was measured on the date given and is not updated afterwards. Whether a finding has since been fixed is deliberately not recorded here, because a status kept in two places goes stale in one of them. That belongs to [the roadmap](../plans/README.md).

Ground truth versions: `@tanstack/router-core@1.171.15`, `@tanstack/react-router@1.170.18`.

Status legend, as in the audit: **[verified]** = reproduced by execution. **[needs-probe]** = code-read evidence only. Both describe the evidence behind the finding, not whether it still holds.

## 1. The story `path` parameter rejects the `to` form of a nested index [verified]

`routing/types.ts:8` types the parameter as `RegisteredFullPath = keyof Register['router']['routesByPath']`, and `routesByPath` is keyed by full paths only. For an index route the full path keeps its trailing slash, so `docs/index.tsx` registers as `/docs/` and nothing registers `/docs`.

TanStack itself treats both as valid and models the difference explicitly. `router-core/routeInfo.d.ts:30-32` defines `RouteToPathAlwaysTrailingSlash`, `RouteToPathNeverTrailingSlash` and `RouteToPathPreserveTrailingSlash`, the union of the two. The no-slash form is what `<Link to="/docs">` takes, which is the form the documentation teaches everywhere.

So a user writing the URL their app serves, in the form TanStack asks for elsewhere, gets a type error:

```
error TS2820: Type '"/docs"' is not assignable to type 'keyof FileRoutesByFullPath | undefined'.
  Did you mean '"/docs/"'?
```

Only the type objects. The app answers both URLs, proven by the e2e twin in `e2e/router-standalone.spec.ts`, which visits `/docs` and `/docs/` and asserts the same content for each.

The gauge at `apps/router-standalone/src/routes/docs/index.stories.tsx` needed `as never` to compile, matching how `apps/router-code` already casts. The sibling settings gauge needed no cast, which is what made the shape clear: `settings/_tabs/index.tsx` sits under a pathless layout, and that layout contributes `/settings` as a full path in its own right, so both forms happen to be expressible there. Remove the layout and only the trailing-slash form survives.

Impact is small but lands on the beginner path: a story for a plain nested index, written with the URL from the address bar, does not typecheck. The likely fix is to widen the parameter from the `routesByPath` keys to something equivalent to `RouteToPathPreserveTrailingSlash`, so both forms are accepted for the routes that have both.

Not the same as the trailing-slash defects already tracked (`isPathlessFileRouteId`, the nested standalone index 404). Those are runtime; this one is types only, and it survives on every channel including `patched`.
