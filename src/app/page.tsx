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
    <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <a href="/" className="hover:opacity-70 transition-opacity">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            進研模試 大学コード検索
          </h1>
        </a>
        <p className="mt-1 text-sm text-gray-500">
          大学名・コード番号から10桁の大学学部学科コードを検索
        </p>
      </header>

      <div className="mb-4">
        <SuggestionDropdown
          query={query}
          onQueryChange={handleValueChange}
          onSubmit={handleSubmit}
          onClear={handleClear}
          suggestions={suggestions}
          loading={suggestLoading}
        />
      </div>

      {!query && <QuickSearch onSelect={handleQuickSearch} />}

      {query && (
        <div className="mb-4">
          <button
            onClick={handleClear}
            className="mb-3 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ← 戻る
          </button>
          <FilterTabs state={filterState} onChange={handleFilterChange} />
        </div>
      )}

      {loading && (
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border-2 border-gray-300 border-t-[#4a6fa5] rounded-full animate-spin" />
          検索中...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {query && !loading && (
        <div className="text-xs text-gray-400 mb-3">
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

      <footer className="mt-auto pt-8 text-center text-xs text-gray-400">
        出典：ベネッセ 大学コード表 | 結果は参考値です。出願の際は必ず一次資料を確認してください。
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          読み込み中...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
