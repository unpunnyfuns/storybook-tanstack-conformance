/**
 * Runs both apps' story suites and writes results.json with the pass/fail
 * counts and the framework version. Comparison against previous runs
 * happens in the status job (scripts/update-status.mjs).
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

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
