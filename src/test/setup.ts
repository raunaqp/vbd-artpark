import "@testing-library/jest-dom";

// jsdom in this setup does not ship a working Storage — provide a minimal
// in-memory localStorage so storage-backed code can run under tests.
if (typeof localStorage === "undefined" || typeof localStorage.setItem !== "function") {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() { return store.size; },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => { store.delete(k); },
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
  };
  Object.defineProperty(window, "localStorage", { value: memoryStorage, writable: true, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: memoryStorage, writable: true, configurable: true });
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
