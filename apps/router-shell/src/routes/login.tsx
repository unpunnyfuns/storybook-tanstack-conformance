import { Link, createFileRoute } from "@tanstack/react-router";

// Outside the shell: proves `_app` is a real boundary rather than decoration,
// and gives the app a second top-level route so `/` is not the only URL.
export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div className="panel">
      <h1>Log in</h1>
      <p>This page renders outside the app shell, so it has no shell chrome.</p>
      <Link to="/">Back to the app</Link>
    </div>
  );
}
