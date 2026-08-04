# Apps

Why each workspace exists and what only it can measure. The [README](../README.md) carries the table of apps and their story counts; this file explains the shape each one covers and why it needs its own workspace.

`apps/router-shell` is a second file-based Router app for one route
shape the routing-mode grid cannot host. Its whole route tree lives under a
root-level pathless layout, so the layout's index owns `/` and the app has no
`src/routes/index.tsx`. `apps/router` cannot cover this because its own root
index already claims `/`; a root-level pathless layout with an index child
would collide with it. The shape is the standard app-shell pattern: chrome
and auth context in one layout, a `/login` route outside it.

`apps/router-autoload` is the instrument for one framework capability the
other apps cannot measure. A file route carries only its own file path until
`routeTree.gen.ts` runs `.update()` over it and supplies the id, path and
parent that place it in a tree. An app gets that from its entry module, which
Storybook never loads, so every other file-based app here imports
`src/routeTree.gen` from `.storybook/preview.tsx` by hand. That import is a
global side effect: it applies to every story in an app or to none, which is
why this needs its own workspace rather than a story elsewhere. Its preview
deliberately omits the import, and its single story asserts both the layout
chrome and the layout's `beforeLoad` context, neither of which can reach a
route that arrived without a parent. The story is expected to fail until the
framework locates and runs the generated tree itself; the Playwright twin
passes, because the real app loads the tree from `src/main.tsx`.

`apps/router-standalone` is the counterpart to that: the same file routes with
the tree connection turned off (`generatedRouteTree: false`). A file route then
reaches a story carrying nothing but its own path, so its layout cannot render,
because that layout's component lives in a module only the generated tree
imports. Its gauges are the one deliberate exception to asserting what the real
app does: the Playwright twin shows the layout and its context, and the stories
assert both are absent, which pins what the opt-out costs. On `main` and `next`
the same setup does not degrade but throws `Duplicate routes found`.

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

The two grid file-based apps carry the full
[scenario matrix](docs/scenarios.md); the code and virtual apps prove the same
framework machinery against their routing modes (id-only layouts, params +
search, loaders and loaderDeps, server functions, tree mode).

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
