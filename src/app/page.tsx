"use client";

import { Suspense } from "react";
import { SuggestionDropdown } from "@/components/suggestion-dropdown";
import { QuickSearch } from "@/components/quick-search";
import { FilterTabs } from "@/components/filter-tabs";
import { ResultList } from "@/components/result-list";
import { useSearch } from "@/lib/use-search";

function HomeContent() {
  const {
    query, results, total, loading, error, page, totalPages,
    suggestions, suggestLoading, filterState,
    handleValueChange, handleSubmit, handleQuickSearch, handleClear,
    handleFilterChange, doSearch,
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
        {/* Ambient glow behind search */}
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

      {!query && <QuickSearch onSelect={handleQuickSearch} />}

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

      {query && !loading && (
        <div className="text-xs text-muted-foreground mb-3">
          {total > 0
            ? `${total}件 が見つかりました`
            : "該当するコードが見つかりませんでした"}
        </div>
      )}

      <ResultList
        results={results}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          setPage(p);
          doSearch(query, p);
        }}
      />

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
