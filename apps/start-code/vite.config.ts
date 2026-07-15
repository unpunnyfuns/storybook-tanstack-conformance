/// <reference types="vitest/config" />
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = import.meta.dirname;

// TanStack Start with code-based routing: the tree is configured in
// src/router.tsx, so route generation is disabled. Storybook and the story
// test runner are client-only and need no router plugin at all.
const inStorybook = Boolean(process.env.STORYBOOK) || process.env.VITEST === "true";

export default defineConfig({
  plugins: [
    ...(inStorybook ? [] : [tanstackStart({ router: { enableRouteGeneration: false } } as never)]),
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
