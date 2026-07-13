import type { Preview } from "@storybook/tanstack-react";
import { authStore } from "../src/auth";
import "../src/routeTree.gen";
import "../src/index.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/iu,
        date: /Date$/iu,
      },
    },

    tanstack: {
      router: {
        context: { auth: authStore },
      },
    },
  },
};

export default preview;
