import { describe, it, expect, beforeEach } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecentSearches } from "../../src/components/recent-searches";
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
} from "../../src/lib/search-history";

describe("RecentSearches component", () => {
  beforeEach(() => {
    clearSearchHistory();
  });

  it("renders nothing when search history is empty", () => {
    const { container } = render(<RecentSearches onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders history chips when items exist and triggers onSelect", () => {
    addSearchHistory("早稲田大学");
    addSearchHistory("東京大学");

    let selected = "";
    render(<RecentSearches onSelect={(q) => { selected = q; }} />);

    expect(screen.getByText("最近の検索")).toBeDefined();
    expect(screen.getByText("東京大学")).toBeDefined();
    expect(screen.getByText("早稲田大学")).toBeDefined();

    fireEvent.click(screen.getByText("東京大学"));
    expect(selected).toBe("東京大学");
  });

  it("deletes a specific item when delete button is clicked", () => {
    addSearchHistory("京都大学");
    addSearchHistory("大阪大学");

    render(<RecentSearches onSelect={() => {}} />);

    const deleteBtn = screen.getByLabelText("「京都大学」を履歴から削除");
    fireEvent.click(deleteBtn);

    expect(getSearchHistory()).toEqual(["大阪大学"]);
  });

  it("clears all items when clear all button is clicked", () => {
    addSearchHistory("早稲田大学");
    addSearchHistory("慶應義塾大学");

    render(<RecentSearches onSelect={() => {}} />);

    const clearAllBtn = screen.getByText("すべて削除");
    fireEvent.click(clearAllBtn);

    expect(getSearchHistory()).toEqual([]);
  });
});
