import type { Preview } from "@storybook/tanstack-react";
import "../src/index.css";
import "./preview.css";

// Deliberately missing: `import "../src/routeTree.gen";`. Every other
// file-based app in this suite carries that import because running the
// generated tree is what gives a file route its id, path and parent, and
// Storybook never loads the app entry that would run it. This app is the
// instrument for the framework doing that itself, so the absence IS the
// experiment. Adding the import here measures nothing; do not add it.
const preview: Preview = {
  parameters: {},
};

export default preview;
