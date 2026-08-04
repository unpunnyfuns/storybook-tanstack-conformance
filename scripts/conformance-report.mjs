/**
 * Runs every app's story suite and writes results.json with the pass/fail
 * counts and the framework version. Comparison against previous runs
 * happens in the status job (scripts/update-status.mjs).
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { relative, resolve } from "node:path";

const apps = readdirSync("apps").toSorted();
const results = {};

// Clear last run's reports before anything else. A suite that dies before
// vitest writes its report (a preset that fails to load, say) leaves the
// previous run's file untouched, and every reader downstream treats it as this
// run's result: the report prints stale counts and `verify.mjs --update`
// records them into expectations.json as though they were measured. That has
// happened, and it is undetectable afterwards, because stale numbers are real
// numbers. Deleting first makes a missing file mean exactly one thing.
rmSync("results.json", { force: true });
for (const app of apps) {
  rmSync(`results-${app}.json`, { force: true });
}

// Resolve the framework from inside an app, not from a hardcoded root path:
// depending on the channel spec npm may nest the package under an app instead
// of hoisting it, and every app is on the same channel (scripts/channel.mjs
// rewrites all or none).
const appRequire = createRequire(resolve(`apps/${apps[0]}/package.json`));
const frameworkVersion = JSON.parse(
  readFileSync(appRequire.resolve("@storybook/tanstack-react/package.json"), "utf8"),
).version;

for (const app of apps) {
  const run = spawnSync(
    "npx",
    ["vitest", "run", "--reporter=json", `--outputFile=../../results-${app}.json`],
    {
      cwd: `apps/${app}`,
      encoding: "utf8",
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  // A non-zero exit is normal and expected: gauges are meant to fail on
  // channels that lack the fix. What is not survivable is the report never
  // being written, which is how a crashed suite differs from a failing one.
  if (!existsSync(`results-${app}.json`)) {
    const cause = run.error ? `: ${run.error.message}` : "";
    throw new Error(
      `apps/${app} produced no test report${cause}. The suite did not run, so its results ` +
        `cannot be measured. Fix the run before recording anything from it.`,
    );
  }
  const report = JSON.parse(readFileSync(`results-${app}.json`, "utf8"));
  // Failing test identities, not just counts: the expected state of the suite
  // lives in expectations.json, and drift is only diagnosable by name.
  const failing = report.testResults
    .flatMap((file) =>
      file.assertionResults
        .filter((test) => test.status === "failed")
        .map((test) => `${relative(resolve(`apps/${app}`), file.name)} > ${test.fullName}`),
    )
    .toSorted();
  results[app] = {
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    total: report.numTotalTests,
    failing,
  };
}

writeFileSync(
  "results.json",
  JSON.stringify({ version: frameworkVersion, apps: results }, null, 2),
);

const lines = [
  `## Conformance: @storybook/tanstack-react@${frameworkVersion}`,
  "",
  "| App | Passed | Failed | Total |",
  "| --- | ------ | ------ | ----- |",
  ...apps.map((app) => {
    const r = results[app];
    return `| ${app} | ${r.passed} | ${r.failed} | ${r.total} |`;
  }),
];

const summary = lines.join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}
