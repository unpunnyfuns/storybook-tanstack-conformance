import type { Preview } from "@storybook/tanstack-react";
import "../src/index.css";
import "./preview.css";

// Deliberately missing: `import "../src/routeTree.gen";`. Here the absence is
// belt and braces rather than the experiment itself, because `main.ts` already
// sets `generatedRouteTree: false` and the framework will not connect the tree
// on its own. Importing it here would connect it anyway and quietly turn this
// app into a duplicate of router-autoload; do not add it.
const preview: Preview = {
  parameters: {},
};

export default preview;
