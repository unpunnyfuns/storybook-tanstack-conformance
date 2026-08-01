/**
 * Compares a conformance run against the expected state of the suite.
 *
 * The suite is red by design on the stock channels — the pending fixes are
 * the reason it exists — so "tests pass" carries no signal. The signal is
 * "exactly the expected tests fail", and that state used to live in commit
 * messages and human memory across channels, apps and story formats.
 * expectations.json makes it a reviewed file: every expected-failing test by
 * name, per channel and app, plus the totals so silent additions show too.
 *
 * Any drift fails the run and names the tests. A newly failing test is a
 * regression; a newly passing one usually means an upstream fix landed, and
 * accepting it is an explicit, reviewable edit:
 *
 *   node scripts/verify.mjs <channel>            # compare (CI does this)
 *   node scripts/verify.mjs <channel> --update   # accept the current state
 *
 * Run after scripts/conformance-report.mjs, which writes results.json.
 */
import { readFileSync, writeFileSync } from "node:fs";

const channel = process.argv[2];
const update = process.argv.includes("--update");
if (!channel) {
  console.error("Usage: node scripts/verify.mjs <channel> [--update]");
  process.exit(1);
}

const results = JSON.parse(readFileSync("results.json", "utf8"));
const expectations = JSON.parse(readFileSync("expectations.json", "utf8"));

if (update) {
  expectations.channels[channel] = {
    version: results.version,
    apps: Object.fromEntries(
      Object.entries(results.apps).map(([app, r]) => [app, { total: r.total, failing: r.failing }]),
    ),
  };
  writeFileSync("expectations.json", JSON.stringify(expectations, null, 2) + "\n");
  console.log(`expectations.json: ${channel} updated from results.json (${results.version})`);
  process.exit(0);
}

const expected = expectations.channels[channel];
if (!expected) {
  console.error(`No expectations recorded for channel "${channel}". Run with --update first.`);
  process.exit(1);
}

const drift = [];
const appNames = new Set([...Object.keys(expected.apps), ...Object.keys(results.apps)]);

for (const app of [...appNames].toSorted()) {
  const want = expected.apps[app];
  const got = results.apps[app];
  if (!want) {
    drift.push(`${app}: not in expectations (new app? run --update)`);
    continue;
  }
  if (!got) {
    drift.push(`${app}: expected but did not run`);
    continue;
  }
  const wantSet = new Set(want.failing);
  const gotSet = new Set(got.failing);
  for (const test of got.failing) {
    if (!wantSet.has(test)) {
      drift.push(`${app}: NEW FAILURE  ${test}`);
    }
  }
  for (const test of want.failing) {
    if (!gotSet.has(test)) {
      drift.push(`${app}: now passing  ${test}`);
    }
  }
  if (got.total !== want.total) {
    drift.push(`${app}: total ${want.total} -> ${got.total} (stories added or removed)`);
  }
}

if (drift.length > 0) {
  console.error(
    `Conformance drift on "${channel}" ` +
      `(expected @${expected.version}, ran @${results.version}):\n` +
      drift.map((line) => `  ${line}`).join("\n") +
      "\n\nIf this state is correct, accept it: node scripts/verify.mjs " +
      `${channel} --update`,
  );
  process.exit(1);
}

console.log(
  `Conformance matches expectations for "${channel}": ` +
    `${Object.keys(expected.apps).length} apps, ` +
    `${Object.values(expected.apps).reduce((n, app) => n + app.failing.length, 0)} expected failures.`,
);
