/**
 * Aggregates the matrix results, builds shields.io endpoint badges, and
 * decides whether the counts changed since the previous run (stored on the
 * `status` branch). Writes everything to out/ for the workflow to commit.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const refs = ["main", "next"];
const current = {};
for (const ref of refs) {
  current[ref] = JSON.parse(readFileSync(`artifacts/results-${ref}/results.json`, "utf8"));
}

let previous = null;
try {
  previous = JSON.parse(execSync("git show origin/status:results.json", { encoding: "utf8" }));
} catch {
  previous = null;
}

const counts = (data) =>
  Object.values(data.apps).reduce(
    (acc, app) => ({ passed: acc.passed + app.passed, total: acc.total + app.total }),
    { passed: 0, total: 0 },
  );

const changed = refs.some((ref) => {
  if (!previous?.[ref]) return true;
  const a = counts(current[ref]);
  const b = counts(previous[ref]);
  return a.passed !== b.passed || a.total !== b.total;
});

mkdirSync("out", { recursive: true });
writeFileSync("out/results.json", JSON.stringify(current, null, 2));

const labels = { main: "storybook@latest", next: "storybook@next" };
const badgeColor = (passed, total) =>
  passed === total ? "brightgreen" : passed >= total / 2 ? "yellow" : "red";

for (const ref of refs) {
  const { passed, total } = counts(current[ref]);
  writeFileSync(
    `out/badge-${ref}.json`,
    JSON.stringify({
      schemaVersion: 1,
      label: `${labels[ref]} (${current[ref].version})`,
      message: `${passed}/${total} passing`,
      color: badgeColor(passed, total),
    }),
  );
  for (const [app, r] of Object.entries(current[ref].apps)) {
    writeFileSync(
      `out/badge-${ref}-${app}.json`,
      JSON.stringify({
        schemaVersion: 1,
        label: app,
        message: `${r.passed}/${r.total}`,
        color: badgeColor(r.passed, r.total),
      }),
    );
  }
}

writeFileSync("out/changed", changed ? "true" : "false");
console.log("changed:", changed);
for (const ref of refs) {
  const { passed, total } = counts(current[ref]);
  console.log(`${ref}: ${passed}/${total} passing (@${current[ref].version})`);
}
