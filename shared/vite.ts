/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import type { PluginOption, UserConfig } from "vite";

export interface AppConfigOptions {
  /** The app's directory (import.meta.dirname of its vite.config.ts). */
  dirname: string;
  /**
   * How the app declares routes. File-based runs the router plugin over
   * src/routes/; virtual adds `virtualRouteConfig: "./src/routes.ts"`;
   * code-based runs no router plugin at all (the tree is built with
   * `createRoute()` in src/router.tsx).
   */
  routing?: "file" | "code" | "virtual";
  /**
   * TanStack Start app. The Start plugin builds an SSR app (server routes,
   * nitro); Storybook and the story test runner are client-only, so under
   * either of those the app uses the bare router-plugin for route-tree
   * generation instead. `@storybook/tanstack-react` mocks the
   * `@tanstack/react-start` imports (server functions and friends) itself.
   */
  start?: boolean;
}

const ROUTER_OPTIONS = {
  target: "react",
  autoCodeSplitting: false,
  routeFileIgnorePattern: ".stories.",
} as const;

const VIRTUAL_ROUTES = "./src/routes.ts";

/**
 * One Vite + Vitest config for every app in the suite. The apps differ only
 * in routing mode and whether they are Start apps; everything else — the
 * react plugin, the Storybook test project, the browser runner — is the same
 * seven times over, and drifted when it was pasted.
 *
 * Plugins are imported dynamically so an app only needs the packages its
 * routing mode uses: router-code has no @tanstack/router-plugin, and only the
 * Start apps have @tanstack/react-start. Hoisting would usually paper over a
 * static import, which is exactly the kind of accident this file exists to
 * avoid.
 */
export async function makeAppConfig({
  dirname,
  routing = "file",
  start = false,
}: AppConfigOptions): Promise<UserConfig> {
  const inStorybook = Boolean(process.env.STORYBOOK) || process.env.VITEST === "true";
  const routerPluginOptions = {
    ...ROUTER_OPTIONS,
    ...(routing === "virtual" ? { virtualRouteConfig: VIRTUAL_ROUTES } : {}),
  };

  const plugins: PluginOption[] = [];
  if (routing !== "code") {
    if (start && !inStorybook) {
      const { tanstackStart } = await import("@tanstack/react-start/plugin/vite");
      plugins.push(
        tanstackStart({
          router: {
            routeFileIgnorePattern: ROUTER_OPTIONS.routeFileIgnorePattern,
            ...(routing === "virtual" ? { virtualRouteConfig: VIRTUAL_ROUTES } : {}),
          },
        } as never),
      );
    } else {
      const { tanstackRouter } = await import("@tanstack/router-plugin/vite");
      plugins.push(tanstackRouter(routerPluginOptions));
    }
  }
  plugins.push(react());

  return {
    plugins,
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
  };
}
