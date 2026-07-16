/**
 * Aggregates the matrix results and builds shields.io endpoint badges.
 * Writes everything to out/ for the workflow to commit to the status branch.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

// Publish whichever refs produced results; a ref whose suite job failed
// (for example a broken build) is simply absent from this run.
const refs = existsSync("artifacts")
  ? readdirSync("artifacts")
      .filter((name) => name.startsWith("results-"))
      .map((name) => name.slice("results-".length))
      .toSorted()
  : [];
const current = {};
for (const ref of refs) {
  current[ref] = JSON.parse(readFileSync(`artifacts/results-${ref}/results.json`, "utf8"));
}

const counts = (data) =>
  Object.values(data.apps).reduce(
    (acc, app) => ({ passed: acc.passed + app.passed, total: acc.total + app.total }),
    { passed: 0, total: 0 },
  );

mkdirSync("out", { recursive: true });
writeFileSync("out/results.json", JSON.stringify(current, null, 2));

const labels = {
  main: "storybook@latest",
  next: "storybook@next",
  patched: "storybook@next + fixes",
};
const badgeColor = (passed, total) => {
  if (total === 0) {
    return "lightgrey";
  }
  return passed === total ? "brightgreen" : passed > total / 2 ? "yellow" : "red";
};

for (const ref of refs) {
  const { passed, total } = counts(current[ref]);
  writeFileSync(
    `out/badge-${ref}.json`,
    JSON.stringify({
      schemaVersion: 1,
      label: `${labels[ref] ?? `storybook@${ref}`} (${current[ref].version})`,
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
        message: r.total === 0 ? "collection crashed" : `${r.passed}/${r.total}`,
        color: badgeColor(r.passed, r.total),
      }),
    );
  }
}

for (const ref of refs) {
  const { passed, total } = counts(current[ref]);
  console.log(`${ref}: ${passed}/${total} passing (@${current[ref].version})`);
}
