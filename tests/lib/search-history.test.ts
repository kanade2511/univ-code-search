import { describe, it, expect, beforeEach } from "bun:test";
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  onSearchHistoryChange,
} from "../../src/lib/search-history";

// Mock localStorage for test environment if not present
const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};

if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage.setItem) {
  // @ts-expect-error test mock
  globalThis.localStorage = mockLocalStorage;
}

if (typeof globalThis.window === "undefined") {
  // @ts-expect-error test mock
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe("search-history", () => {
  beforeEach(() => {
    store.clear();
    clearSearchHistory();
  });

  it("returns empty array initially", () => {
    expect(getSearchHistory()).toEqual([]);
  });

  it("adds a search query to history", () => {
    addSearchHistory("早稲田大学");
    expect(getSearchHistory()).toEqual(["早稲田大学"]);
  });

  it("trims whitespace from queries", () => {
    addSearchHistory("   慶應義塾大学   ");
    expect(getSearchHistory()).toEqual(["慶應義塾大学"]);
  });

  it("ignores empty or whitespace-only queries", () => {
    addSearchHistory("");
    addSearchHistory("   ");
    expect(getSearchHistory()).toEqual([]);
  });

  it("places newest search at the front and deduplicates case-insensitively", () => {
    addSearchHistory("東京大学");
    addSearchHistory("京都大学");
    addSearchHistory("東京大学");

    expect(getSearchHistory()).toEqual(["東京大学", "京都大学"]);
  });

  it("limits history to maximum 8 items", () => {
    for (let i = 1; i <= 10; i++) {
      addSearchHistory(`大学${i}`);
    }

    const history = getSearchHistory();
    expect(history.length).toBe(8);
    expect(history[0]).toBe("大学10");
    expect(history[7]).toBe("大学3");
  });

  it("removes a specific query from history", () => {
    addSearchHistory("東京大学");
    addSearchHistory("京都大学");
    removeSearchHistory("東京大学");

    expect(getSearchHistory()).toEqual(["京都大学"]);
  });

  it("clears all search history", () => {
    addSearchHistory("早稲田");
    addSearchHistory("慶応");
    clearSearchHistory();

    expect(getSearchHistory()).toEqual([]);
  });

  it("notifies listeners on addition, removal, and clear", () => {
    let callCount = 0;
    const unsubscribe = onSearchHistoryChange(() => {
      callCount++;
    });

    addSearchHistory("東大");
    expect(callCount).toBe(1);

    removeSearchHistory("東大");
    expect(callCount).toBe(2);

    clearSearchHistory();
    expect(callCount).toBe(3);

    unsubscribe();
    addSearchHistory("京大");
    expect(callCount).toBe(3);
  });
});
