"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";

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
      {/* Ambient glow behind search */}
      <div
        className="absolute inset-[-40px_-60px_-20px] pointer-events-none z-[-1]"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(74,111,165,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Search wrap — Apple-style hero search */}
      <div className="relative flex items-center bg-popover border border-border rounded-[14px] shadow-sm transition-all duration-200 focus-within:border-accent focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(74,111,165,0.10)]">
        {/* Search icon — 48x48 grid center */}
        <span className="grid place-items-center w-12 h-12 flex-shrink-0 text-muted-foreground" aria-hidden="true">
          <Search className="h-5 w-5" />
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { submitted.current = false; onQueryChange(e.target.value); }}
          onKeyDown={onKey}
          onFocus={() => { if (query && (suggestions.length > 0 || loading)) setOpen(true); }}
          onBlur={() => setTimeout(() => { if (!submitted.current) setOpen(false); }, 200)}
          placeholder="大学名またはコードを入力"
          className="flex-1 border-0 bg-transparent text-base min-[16px] md:text-lg text-foreground placeholder:text-muted-foreground/60 outline-none py-3 pr-2"
          autoComplete="off"
          enterKeyHint="search"
          inputMode="search"
        />

        {/* Clear button — shown only when query has text */}
        {query ? (
          <button
            type="button"
            onClick={() => { onQueryChange(""); onClear?.(); }}
            className="shrink-0 text-muted-foreground hover:text-foreground p-1 mr-1 cursor-pointer transition-colors"
            aria-label="入力をクリア"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* Desktop submit button — hidden on mobile (sm: 640px+) */}
        <button
          type="button"
          onClick={submit}
          className="hidden sm:inline-flex items-center gap-1.5 mr-1.5 my-1.5 px-[18px] py-[10px] border-0 rounded-[10px] bg-accent text-accent-foreground text-sm font-semibold cursor-pointer transition-all duration-200 hover:brightness-90 active:scale-[0.98]"
        >
          <ArrowRight className="h-4 w-4" />
          検索
        </button>
      </div>

      {/* Suggestion dropdown */}
      {open ? (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-4 text-sm text-muted-foreground text-center">検索中...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-4 text-sm text-muted-foreground text-center">該当する大学が見つかりませんでした</div>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); pick(s); }}
                  className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    i === focus
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-accent/5"
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
