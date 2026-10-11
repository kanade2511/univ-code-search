const STORAGE_KEY = "univ-code-recent-searches";
const MAX_HISTORY = 8;

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSearchHistoryChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      notify();
    }
  });
}

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  const cleaned = query.trim();
  if (!cleaned) return;

  try {
    const current = getSearchHistory();
    const filtered = current.filter(
      (item) => item.toLowerCase() !== cleaned.toLowerCase()
    );
    const updated = [cleaned, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notify();
  } catch {
    // LocalStorage quota or access denied
  }
}

export function removeSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  const cleaned = query.trim();
  if (!cleaned) return;

  try {
    const current = getSearchHistory();
    const updated = current.filter(
      (item) => item.toLowerCase() !== cleaned.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notify();
  } catch {
    // LocalStorage quota or access denied
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // LocalStorage quota or access denied
  }
}
