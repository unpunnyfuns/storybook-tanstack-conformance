import { useSyncExternalStore } from "react";

export interface AuthStore {
  isAuthenticated(): boolean;
  toggle(): void;
  subscribe(cb: () => void): () => void;
}

function createAuthStore(): AuthStore {
  let authed = false;
  const listeners = new Set<() => void>();
  return {
    isAuthenticated: () => authed,
    toggle() {
      authed = !authed;
      listeners.forEach((cb) => cb());
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

export const authStore = createAuthStore();

export function useAuth(): boolean {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
    authStore.isAuthenticated,
  );
}
