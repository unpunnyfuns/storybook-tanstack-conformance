/// <reference types="vitest/config" />
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = import.meta.dirname;

// TanStack Start with virtual file routes: the tree structure is declared in
// src/routes.ts. Storybook and the story test runner are client-only, so
// they use the bare router-plugin for route-tree generation.
const inStorybook = Boolean(process.env.STORYBOOK) || process.env.VITEST === "true";

export default defineConfig({
  plugins: [
    inStorybook
      ? tanstackRouter({
          target: "react",
          autoCodeSplitting: false,
          virtualRouteConfig: "./src/routes.ts",
          routeFileIgnorePattern: ".stories.",
        })
      : tanstackStart({
          router: {
            virtualRouteConfig: "./src/routes.ts",
            routeFileIgnorePattern: ".stories.",
          },
        } as never),
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
