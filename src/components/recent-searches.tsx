"use client";

import { useState, useEffect, useCallback } from "react";
import { History, X } from "lucide-react";
import {
  getSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  onSearchHistoryChange,
} from "@/lib/search-history";

type Props = {
  onSelect: (query: string) => void;
};

export function RecentSearches({ onSelect }: Props) {
  const [items, setItems] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setItems(getSearchHistory());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onSearchHistoryChange(refresh);
    return unsub;
  }, [refresh]);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-[0.04em] uppercase text-muted-foreground">
            最近の検索
          </span>
          <span className="text-xs text-muted-foreground/50">({items.length})</span>
        </div>
        <button
          type="button"
          onClick={() => {
            clearSearchHistory();
            refresh();
          }}
          className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors cursor-pointer"
        >
          すべて削除
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item}
            onClick={() => onSelect(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-border bg-popover hover:border-accent hover:bg-accent/5 transition-colors duration-150 text-xs sm:text-[13px] text-foreground cursor-pointer group active:scale-[0.98] select-none"
          >
            <History className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-[260px]">{item}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSearchHistory(item);
                refresh();
              }}
              className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              aria-label={`「${item}」を履歴から削除`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
