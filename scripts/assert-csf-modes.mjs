/**
 * Asserts each app is on the story format it claims to be on.
 *
 * The Vite builder takes a different code path for CSF factories: it emits an
 * import only for the user's own preview file and drops every module a
 * framework or addon preset contributed via `previewAnnotations`. Which path an
 * app takes is decided by a static AST check for a `definePreview` import in
 * `.storybook/preview.*` (`isCsfFactoryPreview`), so editing that file can move
 * an app between paths without any test noticing.
 *
 * Convention: apps whose name ends in `-csf4` must use CSF factories, every
 * other app must not. Without this check the suite could end up measuring one
 * format twice while reporting that it covers both.
 */
import { readdirSync } from "node:fs";

import { loadPreviewOrConfigFile } from "storybook/internal/common";
import { isCsfFactoryPreview, readConfig } from "storybook/internal/csf-tools";

const label = (usesFactories) => (usesFactories ? "CSF factories" : "CSF3");

const apps = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const results = await Promise.all(
  apps.map(async (app) => {
    const previewFile = loadPreviewOrConfigFile({ configDir: `apps/${app}/.storybook` });
    if (!previewFile) {
      return { app, missing: true };
    }
    return { app, actual: isCsfFactoryPreview(await readConfig(previewFile)) };
  }),
);

const failures = [];

for (const { app, actual, missing } of results) {
  if (missing) {
    failures.push(`${app}: no preview file found`);
    continue;
  }

  const expected = app.endsWith("-csf4");
  if (actual === expected) {
    console.log(`ok   ${app.padEnd(16)} ${label(actual)}`);
  } else {
    failures.push(`${app}: expected ${label(expected)}, found ${label(actual)}`);
  }
}

if (failures.length > 0) {
  console.error(`\nStory format mismatch:\n${failures.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
