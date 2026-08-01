import { Link, Navigate, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

/**
 * The three ways an app navigates, side by side. In the real app all three
 * land on /nav-target; a story should behave the same way.
 */
export const Route = createFileRoute("/nav-probe")({
  component: NavProbePage,
});

function NavProbePage() {
  const navigate = useNavigate();
  const [declarative, setDeclarative] = useState(false);
  if (declarative) {
    return <Navigate to="/nav-target" />;
  }
  return (
    <main>
      <h1>Nav probe</h1>
      <Link to="/nav-target">by link</Link>
      <button type="button" onClick={() => void navigate({ to: "/nav-target" })}>
        by hook
      </button>
      <button type="button" onClick={() => setDeclarative(true)}>
        by component
      </button>
    </main>
  );
}
