"use client";

import type { SearchResult } from "@/lib/types";
import { useState } from "react";
import { Copy, Check, Bookmark, ExternalLink } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { useToast } from "@/components/toast";

import { splitQueryTokens, normalizeSearchQuery } from "@/lib/university";
import { getUniversityAlias } from "@/lib/aliases";
import { getPassnaviUrl } from "@/lib/passnavi";

type Props = {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    query?: string;
};

const GROUP_LABELS: Record<string, string> = {
    exact: "完全一致（大学名）",
    code: "完全一致（コード）",
    prefix: "コード前方一致",
    partial: "部分一致",
};

function Highlight({ text, query }: { text: string; query?: string }) {
    if (!text || !query) return <>{text}</>;
    const tokens = splitQueryTokens(query);
    if (tokens.length === 0) return <>{text}</>;

    const keywords: string[] = [];
    for (const t of tokens) {
        if (!t) continue;
        keywords.push(t);
        const norm = normalizeSearchQuery(t);
        if (norm && norm !== t) keywords.push(norm);
        const alias = getUniversityAlias(t);
        if (alias) {
            keywords.push(alias);
            const aliasRoot = alias.replace(/(大学|大学校)$/, "");
            if (aliasRoot && aliasRoot !== alias) keywords.push(aliasRoot);
        }
    }

    const unique = Array.from(new Set(keywords.filter((k) => k.length > 0))).sort(
        (a, b) => b.length - a.length
    );
    if (unique.length === 0) return <>{text}</>;

    const escaped = unique.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`(${escaped})`, "g");
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                unique.includes(part) ? (
                    <mark
                        key={i}
                        className="bg-accent/15 text-accent font-semibold rounded-xs px-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

function FavoriteButton({ code, item }: { code: string; item: SearchResult }) {
    const [fav, setFav] = useState(() => isFavorite(code));
    const [popping, setPopping] = useState(false);

    const handleToggle = () => {
        setPopping(true);
        setTimeout(() => setPopping(false), 400);
        const nowFav = toggleFavorite({
            id: item.id,
            university: item.university,
            faculty: item.faculty,
            department: item.department,
            schedule: item.schedule,
            method: item.method,
            code: item.code,
            univType: item.univType,
            addedAt: Date.now(),
        });
        setFav(nowFav);
    };

    return (
        <span className={`relative inline-flex items-center justify-center shrink-0 ${popping ? "animate-bookmark-burst rounded-full" : ""}`}>
            <Bookmark
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                }}
                className={`w-4 h-4 cursor-pointer transition-all ${
                    popping ? "animate-bookmark-pikon" : ""
                } ${
                    fav
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/25 hover:text-yellow-500"
                }`}
                aria-label={fav ? `${item.university} をブックマークから削除` : `${item.university} をブックマークに追加`}
            />
        </span>
    );
}

function CopyCodeButton({ code }: { code: string }) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(code);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
            toast.show(`コピーしました: ${code}`);
        } catch {
            // clipboard not available
        }
    };

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                handleCopy();
            }}
            className="inline-flex items-center gap-1.5 cursor-pointer group select-none"
            title="クリックでコピー"
        >
            {copied ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
                <Copy className="w-3 h-3 text-muted-foreground/30 group-hover:text-accent/60 transition-colors shrink-0" />
            )}
            <span
                className={`font-mono font-medium transition-colors ${
                    copied
                        ? "text-emerald-700 font-semibold"
                        : "text-accent group-hover:text-accent/80"
                }`}
            >
                {code}
            </span>
        </span>
    );
}

function DesktopTable({ items, query }: { items: SearchResult[]; query?: string }) {
    return (
        <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">大学</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">学部</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">学科</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">日程</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">方式</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs font-mono">コード</th>
                        <th className="text-center px-3 py-3 font-medium text-muted-foreground text-xs w-24">
                            ブックマーク
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r) => (
                        <tr
                            key={r.id}
                            className="border-b border-border/50 last:border-b-0 hover:bg-muted/40 transition-colors duration-150"
                        >
                            <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                    <Highlight text={r.university} query={query} />
                                    <a
                                        href={getPassnaviUrl(r.university)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground/35 hover:text-accent transition-colors inline-flex items-center p-0.5 rounded hover:bg-accent/10"
                                        title="パスナビで科目・配点を見る（外部リンク）"
                                        aria-label={`${r.university}の入試科目・配点をパスナビで見る`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                <Highlight text={r.faculty} query={query} />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground/70 whitespace-nowrap">
                                <Highlight text={r.department} query={query} />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.schedule || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                <Highlight text={r.method || "-"} query={query} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <CopyCodeButton code={r.code} />
                            </td>
                            <td className="px-3 py-3 text-center w-24">
                                <FavoriteButton code={r.code} item={r} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MobileCards({ items, query }: { items: SearchResult[]; query?: string }) {
    return (
        <div className="md:hidden space-y-3">
            {items.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-popover p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                            <Highlight text={r.university} query={query} />
                        </span>
                        <div className="shrink-0 text-right flex items-start gap-2">
                            <FavoriteButton code={r.code} item={r} />
                            <div>
                                <CopyCodeButton code={r.code} />
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1.5">
                        <Highlight text={r.faculty} query={query} />
                        {r.department ? (
                            <>
                                {" / "}
                                <Highlight text={r.department} query={query} />
                            </>
                        ) : ""}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground/70 pt-1">
                        <div className="flex gap-3">
                            <span>日程: {r.schedule || "-"}</span>
                            <span>
                                方式: <Highlight text={r.method || "-"} query={query} />
                            </span>
                        </div>
                        <a
                            href={getPassnaviUrl(r.university)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent/80 transition-colors py-0.5 px-2 rounded-md bg-accent/10 active:scale-95 shrink-0"
                            title="パスナビで科目・配点を見る"
                            aria-label={`${r.university}の入試科目・配点をパスナビで見る`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span>科目・配点</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    onPageChange,
}: Pick<Props, "page" | "totalPages" | "onPageChange">) {
    if (totalPages <= 1) return null;

    const btn =
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-popover text-sm text-muted-foreground font-medium hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 active:scale-95 cursor-pointer";

    return (
        <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={btn}>
                ← 前へ
            </button>
            <span className="text-xs text-muted-foreground/60 tabular-nums font-medium">
                {page} / {totalPages}
            </span>
            <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={btn}>
                次へ →
            </button>
        </div>
    );
}

export function ResultList({
    results,
    total,
    page,
    totalPages,
    onPageChange,
    query,
}: Props) {
    if (results.length === 0) return null;

    return (
        <>
            {(["exact", "code", "prefix", "partial"] as const).map((group) => {
                const items = results.filter((r) => r.matchType === group);
                if (items.length === 0) return null;

                return (
                    <div key={group} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span
                                className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                                aria-hidden="true"
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                                {GROUP_LABELS[group]}
                            </span>
                            <span className="text-xs text-muted-foreground/50">
                                ({items.length})
                            </span>
                            <div className="flex-1 border-t border-border/60" />
                        </div>
                        <DesktopTable items={items} query={query} />
                        <MobileCards items={items} query={query} />
                    </div>
                );
            })}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </>
    );
}
