"use client";

import { Suspense } from "react";
import { SuggestionDropdown } from "@/components/suggestion-dropdown";
import { QuickSearch } from "@/components/quick-search";
import { FilterTabs } from "@/components/filter-tabs";
import { ResultList } from "@/components/result-list";
import { useSearch } from "@/lib/use-search";
import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import { getFavorites, removeFavorite, onFavoritesChange, type FavoriteItem } from "@/lib/favorites";

function FavoritesSection({ onSelect }: { onSelect: (q: string) => void }) {
    const [items, setItems] = useState<FavoriteItem[]>([]);

    useEffect(() => {
        setItems(getFavorites());
        const unsub = onFavoritesChange(() => setItems(getFavorites()));
        return unsub;
    }, []);

    const refresh = () => setItems(getFavorites());

    if (items.length === 0) return null;

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-accent fill-accent" />
                <span className="text-xs font-semibold tracking-[0.04em] uppercase text-muted-foreground">
                    お気に入り
                </span>
                <span className="text-xs text-muted-foreground/50">
                    ({items.length})
                </span>
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">大学</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">区分</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">学部</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">学科</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">日程</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">方式</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs font-mono">コード</th>
                            <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((f) => (
                            <tr
                                key={f.code}
                                className="border-b border-border/50 last:border-b-0 hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
                                onClick={() => onSelect(f.university)}
                            >
                                <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{f.university}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{f.univType}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{f.faculty}</td>
                                <td className="px-4 py-3 text-muted-foreground/70 whitespace-nowrap">{f.department || "-"}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{f.schedule || "-"}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{f.method || "-"}</td>
                                <td className="px-4 py-3 font-mono text-accent font-medium whitespace-nowrap">{f.code}</td>
                                <td className="px-2 py-3 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(f.code);
                                            refresh();
                                        }}
                                        className="p-1 text-muted-foreground/30 hover:text-destructive transition-colors cursor-pointer"
                                        aria-label={`${f.university} をお気に入りから削除`}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile: list */}
            <div className="md:hidden space-y-2">
                {items.map((f) => (
                    <div
                        key={f.code}
                        className="rounded-xl border border-border bg-popover p-3.5 shadow-sm cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => onSelect(f.university)}
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-medium text-foreground">{f.university}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFavorite(f.code);
                                    refresh();
                                }}
                                className="shrink-0 p-0.5 text-muted-foreground/40 hover:text-destructive transition-colors cursor-pointer"
                                aria-label={`${f.university} をお気に入りから削除`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex gap-4">
                                <span>区分: {f.univType}</span>
                                <span className="font-mono text-accent">{f.code}</span>
                            </div>
                            <div>
                                学部: {f.faculty}
                                {f.department ? ` / ${f.department}` : ""}
                            </div>
                            <div className="flex gap-4">
                                <span>日程: {f.schedule || "-"}</span>
                                <span>方式: {f.method || "-"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomeContent() {
  const {
    query, results, total, loading, error, page, totalPages,
    suggestions, suggestLoading, filterState,
    handleValueChange, handleSubmit, handleQuickSearch, handleClear,
    handleFilterChange,
    setPage,
  } = useSearch();

  return (
    <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-4 py-12">
      <header className="mb-10 text-center">
        <a href="/" className="hover:opacity-70 transition-opacity inline-block">
          <h1 className="text-[clamp(22px,4.5vw,32px)] font-bold leading-tight tracking-[-0.02em] text-foreground">
            進研模試 大学コード検索
          </h1>
        </a>
        <p className="mt-2.5 text-[clamp(12px,2.2vw,15px)] text-muted-foreground max-w-[520px] mx-auto">
          大学名・コード番号から10桁の大学学部学科コードを検索
        </p>
      </header>

      <div className="relative mb-6">
        <div
          className="absolute pointer-events-none z-0"
          style={{
            inset: "-40px -60px -20px",
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(74,111,165,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <SuggestionDropdown
            query={query}
            onQueryChange={handleValueChange}
            onSubmit={handleSubmit}
            onClear={handleClear}
            suggestions={suggestions}
            loading={suggestLoading}
          />
        </div>
      </div>

      {!query && (
        <>
          <QuickSearch onSelect={handleQuickSearch} />
          <FavoritesSection onSelect={handleQuickSearch} />
        </>
      )}

      {query && (
        <div className="mb-4">
          <button
            onClick={handleClear}
            className="mb-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← 戻る
          </button>
          <FilterTabs state={filterState} onChange={handleFilterChange} />
        </div>
      )}

      {loading && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3.5 h-3.5 border-2 border-border border-t-accent rounded-full animate-spin" />
          検索中...
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-600 text-sm leading-relaxed">
          {error}
        </div>
      )}

      {query && (
        <div className="text-xs text-muted-foreground mb-3">
          {!loading && total === 0
            ? "該当するコードが見つかりませんでした"
            : total > 0
              ? `${total}件 が見つかりました`
              : null}
        </div>
      )}

      <div className={loading && results.length > 0 ? "opacity-50 transition-opacity" : ""}>
        <ResultList
          results={results}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      <footer className="mt-auto pt-8 pb-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
          出典：ベネッセ 大学コード表 | 結果は参考値です。出願の際は必ず一次資料を確認してください。
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
