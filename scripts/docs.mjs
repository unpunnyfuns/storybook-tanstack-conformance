/**
 * Regenerates the data-driven sections of README.md.
 *
 * The badge tables, the workspace/story-count table and the pending-fixes
 * table are all derived state: apps declare who they are in their
 * package.json `conformance` field, story counts come from expectations.json,
 * and fix rows come from fixes.json. These used to be hand-edited markdown
 * and went stale silently — 28 badge URLs, counts summed by hand in four
 * places, and a fixes table still calling merged PRs open.
 *
 *   node scripts/docs.mjs           # rewrite README sections in place
 *   node scripts/docs.mjs --check   # exit 1 if a rewrite would change them
 *
 * Sections are fenced by `<!-- generated:NAME -->` ... `<!-- generated:end -->`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const STATUS_RAW =
  "https://raw.githubusercontent.com/unpunnyfuns/storybook-tanstack-conformance/status";
const CHANNELS = [
  ["main", "`storybook@latest`"],
  ["next", "`storybook@next`"],
  ["patched", "[`patched`](#pending-fixes)"],
];

const badge = (file, label) =>
  `![${label}](https://img.shields.io/endpoint?url=${encodeURIComponent(`${STATUS_RAW}/${file}.json`)})`;

const apps = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const pkg = JSON.parse(readFileSync(`apps/${entry.name}/package.json`, "utf8"));
    const { port, family, label } = pkg.conformance ?? {};
    if (!port || !family || !label) {
      throw new Error(`apps/${entry.name}: conformance needs port, family and label`);
    }
    return { name: entry.name, port, family, label };
  })
  .toSorted((a, b) => a.port - b.port);

const expectations = JSON.parse(readFileSync("expectations.json", "utf8"));
const { fixes } = JSON.parse(readFileSync("fixes.json", "utf8"));

const table = (header, rows) => {
  const widths = header.map((_, i) =>
    Math.max(...[header, ...rows].map((row) => String(row[i]).length)),
  );
  const line = (row) => `| ${row.map((cell, i) => String(cell).padEnd(widths[i])).join(" | ")} |`;
  return [
    line(header),
    line(widths.map((w) => "-".repeat(w))),
    ...rows.map((row) => line(row)),
  ].join("\n");
};

function storyBadgeTable(family) {
  const columns = apps.filter((app) => app.family === family);
  return table(
    ["stories passing", ...columns.map((app) => app.label)],
    CHANNELS.map(([ref, label]) => {
      const row = [label];
      for (const app of columns) {
        row.push(badge(`badge-${ref}-${app.name}`, app.name));
      }
      return row;
    }),
  );
}

function e2eBadgeTable() {
  const labels = [...new Set(apps.map((app) => app.label))];
  const families = [...new Set(apps.map((app) => app.family))];
  return table(
    ["app e2e", ...labels],
    families.map((family) => {
      const row = [`**${family}**`];
      for (const label of labels) {
        const app = apps.find((a) => a.family === family && a.label === label);
        row.push(app ? badge(`badge-e2e-${app.name}`, `${app.name} e2e`) : "n/a");
      }
      return row;
    }),
  );
}

function workspacesTable() {
  const counts = expectations.channels.main?.apps ?? {};
  const rows = apps.map((app) => [
    `\`apps/${app.name}\``,
    app.family,
    app.label,
    counts[app.name]?.total ?? "?",
  ]);
  const total = Object.values(counts).reduce((n, app) => n + app.total, 0);
  return (
    table(["App", "Family", "Routing / format", "Stories"], rows) +
    `\n\n${total} stories total (from expectations.json, channel \`main\`).`
  );
}

function fixesTable() {
  return table(
    ["Fix", "Scope", "Status", "In `latest`", "In `next`", "Stories fixed"],
    fixes.map((fix) => [
      `[#${fix.pr}](https://github.com/storybookjs/storybook/pull/${fix.pr}) ${fix.title}`,
      fix.scope,
      fix.status,
      fix.inLatest,
      fix.inNext,
      fix.storiesFixed,
    ]),
  );
}

const sections = {
  "badges-router": storyBadgeTable("Router"),
  "badges-start": storyBadgeTable("Start"),
  "badges-e2e": e2eBadgeTable(),
  workspaces: workspacesTable(),
  fixes: fixesTable(),
};

const readme = readFileSync("README.md", "utf8");
let updated = readme;
for (const [name, content] of Object.entries(sections)) {
  const pattern = new RegExp(`(<!-- generated:${name} -->)[\\s\\S]*?(<!-- generated:end -->)`, "u");
  if (!pattern.test(updated)) {
    throw new Error(`README.md is missing the <!-- generated:${name} --> section`);
  }
  updated = updated.replace(pattern, `$1\n\n${content}\n\n$2`);
}

if (process.argv.includes("--check")) {
  if (updated !== readme) {
    console.error("README.md is stale; run: node scripts/docs.mjs");
    process.exit(1);
  }
  console.log("README.md matches its sources.");
} else {
  writeFileSync("README.md", updated);
  console.log(`README.md: regenerated ${Object.keys(sections).length} sections.`);
}
