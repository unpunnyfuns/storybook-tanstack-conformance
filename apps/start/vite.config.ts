/// <reference types="vitest/config" />
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = import.meta.dirname;

// The Start plugin builds an SSR app (server routes, nitro); Storybook and
// the story test runner are client-only, so they use the bare router-plugin
// for route-tree generation instead. `@storybook/tanstack-react` mocks the
// `@tanstack/react-start` imports (server functions and friends) itself.
const inStorybook = Boolean(process.env.STORYBOOK) || process.env.VITEST === "true";

export default defineConfig({
  plugins: [
    inStorybook
      ? tanstackRouter({
          target: "react",
          autoCodeSplitting: false,
          routeFileIgnorePattern: ".stories.",
        })
      : tanstackStart({
          router: { routeFileIgnorePattern: ".stories." },
        }),
    react(),
  ],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
