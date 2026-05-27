"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  suggestions: string[];
  loading?: boolean;
};

export function SuggestionDropdown({
  query,
  onQueryChange,
  onSubmit,
  onClear,
  suggestions,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) { submitted.current = false; return; }
    setOpen(query.length > 0 && (suggestions.length > 0 || loading === true));
    setFocus(0);
  }, [suggestions, loading, query]);

  function submit() {
    submitted.current = true;
    setOpen(false);
    inputRef.current?.blur();
    onSubmit();
  }

  function pick(v: string) {
    onQueryChange(v);
    submit();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      if (open && focus >= 0 && focus < suggestions.length) {
        pick(suggestions[focus]);
      } else {
        submit();
      }
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocus(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocus(i => Math.max(i - 1, 0)); }
    if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { submitted.current = false; onQueryChange(e.target.value); }}
          onKeyDown={onKey}
          onFocus={() => { if (query && (suggestions.length > 0 || loading)) setOpen(true); }}
          onBlur={() => setTimeout(() => { if (!submitted.current) setOpen(false); }, 200)}
          placeholder="大学名またはコードを入力"
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#4a6fa5] focus:ring-3 focus:ring-[#4a6fa5]/20 transition-all outline-none shadow-sm"
          autoComplete="off"
        />
        {query ? (
          <button type="button" onClick={() => { onQueryChange(""); onClear?.(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">検索中...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">該当する大学が見つかりませんでした</div>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((s, i) => (
                <button key={s} type="button"
                  onMouseDown={e => { e.preventDefault(); pick(s); }}
                  className={`w-full text-left px-3 py-2.5 text-sm cursor-pointer ${
                    i === focus ? "bg-[#4a6fa5]/10 text-[#4a6fa5]" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
