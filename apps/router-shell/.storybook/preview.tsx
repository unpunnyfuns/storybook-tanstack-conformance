import type { Preview } from "@storybook/tanstack-react";
// Load-bearing: running routeTree.gen is what gives every file route its path,
// id and parent. The app does this from src/main.tsx, which Storybook never
// loads, so without this import stories receive routes with no context. Not a
// stray import, do not remove.
import "../src/routeTree.gen";
import "../src/index.css";
import "./preview.css";

const preview: Preview = {
  parameters: {},
};

export default preview;
