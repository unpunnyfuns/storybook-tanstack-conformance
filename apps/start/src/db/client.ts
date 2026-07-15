// A stand-in for a server-only database client (postgres, drizzle, ...).
// It must never evaluate in the browser; .storybook/preview.tsx replaces it
// with src/db/__mocks__/client.ts via sb.mock().
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  throw new Error("db/client.ts is server-only and must not load in the browser");
}

export const db = {
  query(_sql: string): Promise<unknown[]> {
    return Promise.resolve([]);
  },
};
