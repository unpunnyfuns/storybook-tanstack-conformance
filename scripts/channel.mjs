/**
 * Points every app at one release channel of the framework.
 *
 * The suite measures three channels — `main` (npm `latest`), `next` (npm
 * `next`) and `patched` (the conformance-build tarball carrying the pending
 * fixes). These used to be git branches whose entire diff was these dependency
 * specs, which meant every change had to be cherry-picked three times and a
 * partial rollout could silently leave some apps measuring the wrong channel
 * (this happened: three apps on the old `next` branch still installed
 * `latest`). A script hits all apps or none.
 *
 * Usage: node scripts/channel.mjs <main|next|patched>
 * After switching channels, run `npm install --prefer-online` so a stale local packument cache cannot pin an outdated dist-tag resolution.
 *
 * Rewrites every app's package.json in place; restore with `git checkout -- apps`.
 * CI runs this after checkout, then installs without a lockfile so each run
 * resolves the channel's current versions.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const TARBALL =
  "https://github.com/unpunnyfuns/storybook-tanstack-conformance/releases/download/conformance-build/storybook-tanstack-react-patched.tgz";

const CHANNELS = {
  main: {
    storybook: "latest",
    "@storybook/addon-vitest": "latest",
    "@storybook/tanstack-react": "latest",
  },
  next: {
    storybook: "next",
    "@storybook/addon-vitest": "next",
    "@storybook/tanstack-react": "next",
  },
  patched: {
    storybook: "next",
    "@storybook/addon-vitest": "next",
    "@storybook/tanstack-react": TARBALL,
  },
};

const channel = process.argv[2];
if (!CHANNELS[channel]) {
  console.error(`Usage: node scripts/channel.mjs <${Object.keys(CHANNELS).join("|")}>`);
  process.exit(1);
}

const specs = CHANNELS[channel];
const apps = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

for (const app of apps) {
  const path = `apps/${app}/package.json`;
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  for (const [name, spec] of Object.entries(specs)) {
    if (pkg.devDependencies?.[name]) {
      pkg.devDependencies[name] = spec;
    }
  }
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`${app}: ${channel}`);
}
