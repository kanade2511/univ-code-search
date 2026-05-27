"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { SearchResult } from "@/lib/types";
import type { FilterAction, FilterState } from "@/components/filter-tabs";

export function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const filterState: FilterState = {
    type: searchParams.get("type") || "",
    schedule: searchParams.get("schedule") || "",
    faculty: searchParams.get("faculty") || "",
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryRef = useRef(query);
  queryRef.current = query;

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
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `サーバーエラー (${res.status})`);
        }
        const data = await res.json();
        setResults(data.results);
        setTotal(data.total);
        updateURL(q, p, ft, fs, ff);
      } catch (e) {
        setError(e instanceof Error ? e.message : "検索に失敗しました");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filterState.type, filterState.schedule, filterState.faculty, updateURL]
  );

  const initialized = useRef(false);
  useEffect(() => {
    if (query && !initialized.current) {
      initialized.current = true;
      doSearch(query, page);
      fetchSuggestions(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
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
    queryRef.current = value;
    setPage(1);
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(value), 200);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(value, 1), 400);
  };

  const handleSubmit = () => {
    clearTimeout(suggestTimer.current);
    clearTimeout(searchTimer.current);
    doSearch(queryRef.current, 1);
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

  return {
    query, results, total, loading, error, page, totalPages,
    suggestions, suggestLoading, filterState,
    handleValueChange, handleSubmit, handleQuickSearch, handleClear,
    handleFilterChange, doSearch,
    setQuery, setResults, setTotal, setPage,
  };
}
