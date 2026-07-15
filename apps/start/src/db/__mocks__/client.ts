// Browser-safe replacement for the server-only db client, applied by
// sb.mock() in .storybook/preview.tsx.
export const db = {
  query(_sql: string): Promise<unknown[]> {
    return Promise.resolve([]);
  },
};
