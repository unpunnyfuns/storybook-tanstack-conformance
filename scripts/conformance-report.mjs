/**
 * Runs both apps' story suites, compares the pass/fail counts against
 * expectations.json, and writes a summary. Exits non-zero only when the
 * results CHANGE: a new framework release fixing or breaking scenarios is
 * exactly the signal this repository exists to catch.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

const apps = ["router", "start"];
const results = {};

const frameworkVersion = JSON.parse(
  readFileSync("node_modules/@storybook/tanstack-react/package.json", "utf8"),
).version;

for (const app of apps) {
  spawnSync("npx", ["vitest", "run", "--reporter=json", `--outputFile=../../results-${app}.json`], {
    cwd: `apps/${app}`,
    encoding: "utf8",
    stdio: ["ignore", "inherit", "inherit"],
  });
  const report = JSON.parse(readFileSync(`results-${app}.json`, "utf8"));
  results[app] = {
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    total: report.numTotalTests,
  };
}

const expected = JSON.parse(readFileSync("expectations.json", "utf8"));

const lines = [
  `## Conformance: @storybook/tanstack-react@${frameworkVersion}`,
  "",
  "| App | Passed | Failed | Total | Expected |",
  "| --- | ------ | ------ | ----- | -------- |",
];

let changed = false;
for (const app of apps) {
  const r = results[app];
  const e = expected[app];
  const matches = r.passed === e.passed && r.failed === e.failed && r.total === e.total;
  if (!matches) changed = true;
  lines.push(
    `| ${app} | ${r.passed} | ${r.failed} | ${r.total} | ${
      matches ? "matches" : `CHANGED (was ${e.passed}/${e.failed}/${e.total})`
    } |`,
  );
}

lines.push(
  "",
  changed
    ? "Results changed. A framework release fixed or broke scenarios; update expectations.json after reviewing."
    : "Results match expectations.",
);

const summary = lines.join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
}

process.exit(changed ? 1 : 0);
