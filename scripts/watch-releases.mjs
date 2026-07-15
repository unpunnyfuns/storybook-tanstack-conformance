/**
 * Compares the published @storybook/tanstack-react dist-tags with the
 * versions last tested on the status branch (results.json, passed as argv[2]).
 * Writes changed=true/false to GITHUB_OUTPUT for the workflow to act on.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

const tested = JSON.parse(readFileSync(process.argv[2], "utf8"));
const tags = { main: "latest", next: "next", canary: "canary" };

const changed = [];
for (const [ref, tag] of Object.entries(tags)) {
  const published = execFileSync("npm", ["view", `@storybook/tanstack-react@${tag}`, "version"], {
    encoding: "utf8",
  }).trim();
  const last = tested[ref]?.version;
  if (published !== last) {
    changed.push(`${ref}: ${last ?? "never tested"} -> ${published}`);
  }
}

console.log(changed.length > 0 ? `New release:\n${changed.join("\n")}` : "No new releases.");

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed.length > 0}\n`);
}
