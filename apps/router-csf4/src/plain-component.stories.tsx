import preview from "#.storybook/preview";
import { Link } from "@tanstack/react-router";
import { expect } from "storybook/test";

// No route at all: the framework builds a synthetic router around the story.
// This is the case that proves the framework's own preview annotations reach a
// CSF factory project, since nothing here asks for them explicitly.
function Badge() {
  return (
    <div className="panel">
      <h1>Badge</h1>
      <Link to="/about">About</Link>
    </div>
  );
}

const meta = preview.meta({
  component: Badge,
  tags: ["ai-generated"],
});

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("heading", { name: "Badge" })).toBeVisible();
    await expect(await canvas.findByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  },
});
