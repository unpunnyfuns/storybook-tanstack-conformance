import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  clientPhaseLog,
  cookieEcho,
  increment,
  respond,
  tracked,
  whoAmI,
} from "../server-probe-fns";

export const Route = createFileRoute("/server-probes")({
  component: ServerProbesPage,
});

function ServerProbesPage() {
  const [results, setResults] = useState<Record<string, string>>({});
  const record = (key: string, run: () => Promise<unknown>) => async () => {
    let value: unknown;
    try {
      value = await run();
    } catch (error) {
      value = `error: ${String(error)}`;
    }
    setResults((prev) => ({ ...prev, [key]: String(value) }));
  };
  return (
    <main>
      <h1>Server probes</h1>
      <button type="button" onClick={record("user", () => whoAmI())}>
        who am i
      </button>
      <button type="button" onClick={record("sum", () => increment({ data: "1" }))}>
        increment
      </button>
      <button type="button" onClick={record("cookie", () => cookieEcho())}>
        cookie echo
      </button>
      <button
        type="button"
        onClick={record(
          "traced",
          async () =>
            `${await tracked()} ${clientPhaseLog.length > 0 ? "with" : "without"} client phase`,
        )}
      >
        tracked
      </button>
      <button type="button" onClick={record("raw", async () => (await respond()).text())}>
        respond
      </button>
      <p>user: {results.user ?? "pending"}</p>
      <p>sum: {results.sum ?? "pending"}</p>
      <p>cookie: {results.cookie ?? "pending"}</p>
      <p>traced: {results.traced ?? "pending"}</p>
      <p>raw: {results.raw ?? "pending"}</p>
    </main>
  );
}
