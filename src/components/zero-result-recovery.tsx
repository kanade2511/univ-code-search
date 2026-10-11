"use client";

import { SearchX, RotateCcw, Lightbulb, Sparkles } from "lucide-react";
import { splitQueryTokens, normalizeSearchQuery } from "@/lib/university";
import { getUniversityAlias } from "@/lib/aliases";

type Props = {
  query: string;
  onClear: () => void;
  onSelectQuery: (query: string) => void;
};

const POPULAR_SUGGESTIONS = [
  { label: "東京大学", query: "東京大学" },
  { label: "京都大学", query: "京都大学" },
  { label: "早稲田大学", query: "早稲田大学" },
  { label: "慶應義塾大学", query: "慶應義塾大学" },
  { label: "明治大学", query: "明治大学" },
  { label: "大阪大学", query: "大阪大学" },
];

export function ZeroResultRecovery({ query, onClear, onSelectQuery }: Props) {
  // Compute possible recovery suggestion (e.g. if query has multiple words, suggest first word)
  const tokens = splitQueryTokens(query);
  const shortenedSuggestion = (() => {
    if (tokens.length > 1) {
      return tokens[0];
    }
    const norm = normalizeSearchQuery(query);
    if (norm && norm !== query && norm.length >= 2) {
      return norm;
    }
    const alias = getUniversityAlias(query);
    if (alias && alias !== query) {
      return alias;
    }
    return null;
  })();

  return (
    <div className="rounded-2xl border border-border bg-popover/80 p-6 md:p-8 shadow-xs text-left my-4">
      {/* Hero empty state */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border/60">
        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <SearchX className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            「<span className="text-accent">{query}</span>」に一致するコードが見つかりませんでした
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            入力の表記をご確認いただくか、以下のヒントをお試しください。
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-popover hover:bg-muted/50 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          検索条件をクリア
        </button>
      </div>

      {/* Suggested alternative query if available */}
      {shortenedSuggestion && shortenedSuggestion !== query && (
        <div className="mt-5 p-3.5 rounded-xl bg-accent/5 border border-accent/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <span>
              もしかして：
              <strong className="font-semibold text-accent ml-1">
                「{shortenedSuggestion}」
              </strong>
              で探していませんか？
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectQuery(shortenedSuggestion)}
            className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-medium hover:brightness-95 transition-all cursor-pointer"
          >
            「{shortenedSuggestion}」で再検索
          </button>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-6">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
          検索のヒント
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            <span className="font-bold text-foreground shrink-0">・</span>
            <div>
              <span className="font-medium text-foreground">単語を区切って検索:</span>
              <p className="text-muted-foreground/80 mt-0.5 text-xs">
                「早稲田法学部」より「早稲田 法」のようにスペースで区切ると見つかりやすくなります。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            <span className="font-bold text-foreground shrink-0">・</span>
            <div>
              <span className="font-medium text-foreground">略称・ひらがなで検索:</span>
              <p className="text-muted-foreground/80 mt-0.5 text-xs">
                「東大」「きょうだい」「名大」「マーチ」などの通称入力にも対応しています。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            <span className="font-bold text-foreground shrink-0">・</span>
            <div>
              <span className="font-medium text-foreground">大学名のみで検索:</span>
              <p className="text-muted-foreground/80 mt-0.5 text-xs">
                学部や日程を入れずに大学名だけで検索し、一覧から選ぶこともできます。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
            <span className="font-bold text-foreground shrink-0">・</span>
            <div>
              <span className="font-medium text-foreground">コード番号で検索:</span>
              <p className="text-muted-foreground/80 mt-0.5 text-xs">
                4桁の大学コード（例: 2450）や10桁の学部学科コードで直接指定も可能です。
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Popular Universities Shortcuts */}
      <div className="mt-6 pt-5 border-t border-border/50">
        <span className="text-xs font-medium text-muted-foreground block mb-2.5">
          主要大学から探す：
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectQuery(item.query)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border bg-popover hover:border-accent hover:bg-accent/5 text-foreground transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
