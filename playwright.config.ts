import { defineConfig } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

// App-level end-to-end tests: each app runs as a real dev server and a spec
// asserts its routes work in a browser. This keeps the "each app is its own
// control" claim honest.
//
// The app list is discovered, not declared: every directory under apps/ must
// carry `conformance.port` in its package.json and an e2e/<name>.spec.ts.
// Throwing on a missing or duplicate port beats a silently absent project.
const apps = readdirSync("apps", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const pkg = JSON.parse(readFileSync(`apps/${entry.name}/package.json`, "utf8"));
    const port: number | undefined = pkg.conformance?.port;
    if (!port) {
      throw new Error(`apps/${entry.name}/package.json is missing conformance.port`);
    }
    return { name: entry.name, port };
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

const duplicates = apps.filter((app, _, all) =>
  all.some((other) => other !== app && other.port === app.port),
);
if (duplicates.length > 0) {
  throw new Error(`Duplicate e2e ports: ${duplicates.map((a) => a.name).join(", ")}`);
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  projects: apps.map(({ name, port }) => ({
    name,
    testMatch: `${name}.spec.ts`,
    use: { baseURL: `http://localhost:${port}` },
  })),
  webServer: apps.map(({ name, port }) => ({
    command: `npm run dev -w apps/${name} -- --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  })),
});
