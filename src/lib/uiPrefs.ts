import { useSyncExternalStore } from "react";

// Local device preferences (per browser), shared across components.
export type UiPrefs = { animations: boolean; sidebarCompact: boolean };
const KEY = "ui.prefs";
const DEFAULTS: UiPrefs = { animations: true, sidebarCompact: false };
const listeners = new Set<() => void>();

function read(): UiPrefs {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULTS; }
}
let cache = read();

export function setUiPref<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) {
  cache = { ...cache, [key]: value };
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function useUiPrefs(): UiPrefs {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => cache,
  );
}
