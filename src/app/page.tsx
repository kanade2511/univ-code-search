"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SuggestionDropdown } from "@/components/suggestion-dropdown";
import { QuickSearch } from "@/components/quick-search";
import { FilterTabs, type FilterAction, type FilterState } from "@/components/filter-tabs";
import { ResultList } from "@/components/result-list";
import { ErrorBoundary } from "@/components/error-boundary";
import type { SearchResult } from "@/lib/types";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          読み込み中...
        </div>
      }
    >
        <ErrorBoundary>
          <HomeContent />
        </ErrorBoundary>
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Filters from URL
  const filterState: FilterState = {
    type: searchParams.get("type") || "",
    schedule: searchParams.get("schedule") || "",
    faculty: searchParams.get("faculty") || "",
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const updateURL = useCallback(
    (q: string, p: number, type: string, schedule: string, faculty: string) => {
      const params = new URLSearchParams();
      params.set("q", q);
      if (p > 1) params.set("page", String(p));
      if (type) params.set("type", type);
      if (schedule) params.set("schedule", schedule);
      if (faculty) params.set("faculty", faculty);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  const doSearch = useCallback(
    async (q: string, p: number, type?: string, schedule?: string, faculty?: string) => {
      const ft = type ?? filterState.type;
      const fs = schedule ?? filterState.schedule;
      const ff = faculty ?? filterState.faculty;
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      setError("");
      try {
        let url = `/api/search?q=${encodeURIComponent(q)}&page=${p}`;
        if (ft) url += `&type=${encodeURIComponent(ft)}`;
        if (fs) url += `&schedule=${encodeURIComponent(fs)}`;
        if (ff) url += `&faculty=${encodeURIComponent(ff)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("検索に失敗しました");
        const data = await res.json();
        setResults(data.results);
        setTotal(data.total);
        updateURL(q, p, ft, fs, ff);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filterState.type, filterState.schedule, filterState.faculty, updateURL]
  );

  // Initial search from URL params
  const initialized = useRef(false);
  useEffect(() => {
    if (query && !initialized.current) {
      initialized.current = true;
      doSearch(query, page);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setSuggestLoading(true);
    try {
      const res = await fetch(`/api/universities?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestions(data.universities);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const handleValueChange = (value: string) => {
    setQuery(value);
    setPage(1);
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(value), 200);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(value, 1), 400);
  };

  const handleSubmit = () => {
    clearTimeout(suggestTimer.current);
    clearTimeout(searchTimer.current);
    doSearch(query, 1);
  };

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    setPage(1);
    setSuggestions([]);
    clearTimeout(suggestTimer.current);
    clearTimeout(searchTimer.current);
    doSearch(q, 1);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setTotal(0);
    setPage(1);
    setError("");
    setSuggestions([]);
    router.replace(pathname, { scroll: false });
  };

  const handleFilterChange = (action: FilterAction) => {
    if (!query) return;
    const newType = action.type === "type" ? action.value : filterState.type;
    const newSchedule = action.type === "schedule" ? action.value : filterState.schedule;
    const newFaculty = action.type === "faculty" ? action.value : filterState.faculty;
    doSearch(query, 1, newType, newSchedule, newFaculty);
  };

  useEffect(() => {
    return () => {
      clearTimeout(suggestTimer.current);
      clearTimeout(searchTimer.current);
    };
  }, []);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl px-4 py-8">
      <header className="relative mb-8 text-center">
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setTotal(0);
              setPage(1);
              setError("");
              router.replace(pathname, { scroll: false });
            }}
            className="absolute left-4 top-4 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ← 戻る
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          進研模試 大学コード検索
        </h1>
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

      {query && <FilterTabs state={filterState} onChange={handleFilterChange} />}

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
