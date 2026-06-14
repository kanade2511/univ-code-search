"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import type { SearchResult } from "@/lib/types";
import type { FilterAction, FilterState } from "@/components/filter-tabs";
import { sanitizeQuery } from "@/lib/query";

export function useSearch() {
    // URL state — nuqs handles sync, typing, defaults
    const [query, setQuery] = useQueryState(
        "q",
        parseAsString.withDefault("")
    );
    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(1)
    );
    const [type, setType] = useQueryState(
        "type",
        parseAsString.withDefault("")
    );
    const [schedule, setSchedule] = useQueryState(
        "schedule",
        parseAsString.withDefault("")
    );
    const [faculty, setFaculty] = useQueryState(
        "faculty",
        parseAsString.withDefault("")
    );

    // Immediate input state (for responsive typing feel)
    // nuqs state lags behind URL commit, so we track typing separately
    const [inputValue, setInputValue] = useState(query);
    const inputRef = useRef(query);

    const [results, setResults] = useState<SearchResult[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Suggestions
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const suggestTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const suggestSeq = useRef(0);

    const filterState: FilterState = { type, schedule, faculty };

    // Sync input when URL query changes (from QuickSearch, URL load, etc.)
    useEffect(() => {
        setInputValue(query);
        inputRef.current = query;
    }, [query]);

    // --- Search effect: fires when URL params change ---
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setTotal(0);
            setError("");
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError("");

        let url = `/api/search?q=${encodeURIComponent(query)}&page=${page}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        if (schedule) url += `&schedule=${encodeURIComponent(schedule)}`;
        if (faculty) url += `&faculty=${encodeURIComponent(faculty)}`;

        fetch(url)
            .then((res) => {
                if (cancelled) return;
                if (!res.ok)
                    return res.json().then((b) => {
                        throw new Error(
                            b.error || `サーバーエラー (${res.status})`
                        );
                    });
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                setResults(data.results);
                setTotal(data.total);
            })
            .catch((e) => {
                if (cancelled) return;
                setError(
                    e instanceof Error
                        ? e.message
                        : "検索に失敗しました"
                );
                setResults([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [query, page, type, schedule, faculty]);

    // --- Suggestions ---
    const fetchSuggestions = useCallback(async (q: string) => {
        const seq = ++suggestSeq.current;
        if (!q.trim()) {
            setSuggestions([]);
            return;
        }
        setSuggestLoading(true);
        try {
            const res = await fetch(
                `/api/universities?q=${encodeURIComponent(q)}`
            );
            if (seq !== suggestSeq.current) return;
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (seq !== suggestSeq.current) return;
            setSuggestions(data.universities);
        } catch {
            if (seq === suggestSeq.current) setSuggestions([]);
        } finally {
            if (seq === suggestSeq.current) setSuggestLoading(false);
        }
    }, []);

    const handleValueChange = (value: string) => {
        const sanitized = sanitizeQuery(value);
        if (!sanitized) {
            handleClear();
            return;
        }
        // Immediate visual update
        setInputValue(value);
        inputRef.current = value;
        // Debounce suggestions at 200ms
        clearTimeout(suggestTimer.current);
        suggestTimer.current = setTimeout(
            () => fetchSuggestions(value),
            200
        );
        // Debounce search/URL update at 400ms
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(
            () => setQuery(value),
            400
        );
    };

    const handleSubmit = () => {
        clearTimeout(suggestTimer.current);
        clearTimeout(searchTimer.current);
        // Use ref to get the latest typed value
        setQuery(inputRef.current);
    };

    const handleQuickSearch = (q: string) => {
        clearTimeout(suggestTimer.current);
        clearTimeout(searchTimer.current);
        setInputValue(q);
        inputRef.current = q;
        setQuery(q);
        setPage(1);
        setSuggestions([]);
    };

    const handleClear = () => {
        clearTimeout(suggestTimer.current);
        clearTimeout(searchTimer.current);
        setInputValue("");
        inputRef.current = "";
        setQuery(null);
        setType(null);
        setSchedule(null);
        setFaculty(null);
        setPage(null);
        setResults([]);
        setTotal(0);
        setError("");
        setSuggestions([]);
    };

    const handleFilterChange = (action: FilterAction) => {
        if (action.type === "type") setType(action.value || null);
        if (action.type === "schedule")
            setSchedule(action.value || null);
        if (action.type === "faculty")
            setFaculty(action.value || null);
        setPage(1);
    };

    useEffect(() => {
        return () => {
            clearTimeout(suggestTimer.current);
            clearTimeout(searchTimer.current);
        };
    }, []);

    const totalPages = Math.ceil(total / 50);

    return {
        query: inputValue, // show immediate input value, not debounced URL value
        results,
        total,
        loading,
        error,
        page,
        totalPages,
        suggestions,
        suggestLoading,
        filterState,
        handleValueChange,
        handleSubmit,
        handleQuickSearch,
        handleClear,
        handleFilterChange,
        setPage,
    };
}
