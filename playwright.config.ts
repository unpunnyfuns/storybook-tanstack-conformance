import { defineConfig } from "@playwright/test";

// App-level end-to-end tests: each app runs as a real dev server and a spec
// asserts its routes work in a browser. This keeps the "each app is its own
// control" claim honest. start-code runs in dev only: TanStack Start cannot
// BUILD a purely code-based route tree (its manifest requires generated
// routes), but dev-mode SSR works fine.
const apps = [
  { name: "router", port: 5301 },
  { name: "router-code", port: 5302 },
  { name: "router-virtual", port: 5303 },
  { name: "start", port: 5304 },
  { name: "start-virtual", port: 5305 },
  { name: "start-code", port: 5306 },
];

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
