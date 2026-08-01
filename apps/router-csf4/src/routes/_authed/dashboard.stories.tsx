import preview from "#.storybook/preview";
import { expect } from "storybook/test";
import { Route } from "./dashboard";

// A route under a pathless layout: the assertion reads context the layout
// supplies via `beforeLoad`, so it fails if the story renders standalone
// instead of inside the layout.
const meta = preview.meta({
  parameters: {
    layout: "fullscreen",
    tanstack: { router: { route: Route } },
  },
  tags: ["ai-generated"],
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(canvas.getByText(/Signed in as:/u).textContent).toContain("Ada Lovelace");
  },
});
