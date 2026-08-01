import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

/**
 * Server-function semantics probes. Each fn isolates one behavior the real
 * runtime guarantees; the /server-probes page runs them and prints results so
 * the same assertions hold in a story and in a Playwright test.
 */

export const clientPhaseLog: string[] = [];

const loggingMiddleware = createMiddleware({ type: "function" }).client(({ next }) => {
  clientPhaseLog.push("client phase ran");
  return next();
});

const userMiddleware = createMiddleware({ type: "function" }).server(({ next }) =>
  next({ context: { user: "ada" } }),
);

/** Middleware server phase seeds context; the handler reads it. */
export const whoAmI = createServerFn({ method: "GET" })
  .middleware([userMiddleware])
  .handler(({ context }) => (context as { user?: string }).user ?? "nobody");

/** Middleware client phase runs in the browser before the call goes out. */
export const tracked = createServerFn({ method: "GET" })
  .middleware([loggingMiddleware])
  .handler(() => "tracked ok");

/** The validator transforms input before the handler sees it. */
export const increment = createServerFn({ method: "POST" })
  .validator(Number)
  .handler(({ data }) => (data as number) + 1);

/** setCookie writes the response; getCookie reads the request. They do not meet. A fresh name per call keeps the probe idempotent under retried clicks. */
export const cookieEcho = createServerFn({ method: "POST" }).handler(() => {
  const name = `probe-${Math.random().toString(36).slice(2)}`;
  setCookie(name, "abc");
  return getCookie(name) ?? "unset";
});
