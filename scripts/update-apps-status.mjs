/**
 * Turns Playwright's JSON report into one shields.io endpoint badge per app
 * (project). Writes to out/ for the workflow to commit to the status branch.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const report = JSON.parse(readFileSync("playwright-results.json", "utf8"));

const perApp = {};
function walk(suite) {
  for (const child of suite.suites ?? []) {
    walk(child);
  }
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const app = test.projectName;
      perApp[app] ??= { passed: 0, total: 0 };
      perApp[app].total += 1;
      if (test.status === "expected") {
        perApp[app].passed += 1;
      }
    }
  }
}
for (const suite of report.suites ?? []) {
  walk(suite);
}

mkdirSync("out", { recursive: true });
for (const [app, r] of Object.entries(perApp)) {
  writeFileSync(
    `out/badge-e2e-${app}.json`,
    JSON.stringify({
      schemaVersion: 1,
      label: `${app} e2e`,
      message: `${r.passed}/${r.total}`,
      color: r.passed === r.total ? "brightgreen" : "red",
    }),
  );
  console.log(`${app}: ${r.passed}/${r.total}`);
}
