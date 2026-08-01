import { definePreview } from "@storybook/tanstack-react";
// Load-bearing: running routeTree.gen is what gives every file route its path,
// id and parent. The app does this from src/main.tsx, which Storybook never
// loads, so without this import stories receive routes with no context. Not a
// stray import, do not remove.
//
// It still runs under CSF factories because this file is the one module the
// builder always emits an import for. Modules a framework or addon preset
// contributes via `previewAnnotations` are dropped on this code path, so this
// import cannot be replaced by one.
import "../src/routeTree.gen";
import "../src/index.css";
import "./preview.css";

// No `route:` here on purpose. Passing the tree would also register it as a
// project-wide default route, which silently moves every routeless story off
// the synthetic router and onto the whole app tree.
export default definePreview({});
