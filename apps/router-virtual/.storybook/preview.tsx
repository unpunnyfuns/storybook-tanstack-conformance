import { definePreview } from "@storybook/tanstack-react";
import { routeTree } from "../src/routeTree.gen";
import "./preview.css";

export default definePreview({
  parameters: {
    tanstack: {
      router: {
        route: routeTree,
      },
    },
  },
});
