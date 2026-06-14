"use client";

import type { SearchResult } from "@/lib/types";
import { useState } from "react";
import { Copy, Check, Heart } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

type Props = {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const GROUP_LABELS: Record<string, string> = {
    exact: "完全一致（大学名）",
    code: "完全一致（コード）",
    prefix: "コード前方一致",
    partial: "部分一致",
};

function FavoriteButton({ code, item }: { code: string; item: SearchResult }) {
    const [fav, setFav] = useState(() => isFavorite(code));

    const handleToggle = () => {
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
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleToggle();
            }}
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all cursor-pointer ${
                fav
                    ? "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100"
                    : "text-muted-foreground/60 hover:text-pink-500 hover:bg-pink-50/50 border border-border/60 hover:border-pink-200/50"
            }`}
            aria-label={fav ? `${item.university} をお気に入りから削除` : `${item.university} をお気に入りに追加`}
        >
            <Heart
                className={`w-3 h-3 ${fav ? "fill-pink-500 text-pink-500" : ""}`}
            />
            お気に入り
        </button>
    );
}

function CopyCodeButton({ code }: { code: string }) {
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
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard not available
        }
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleCopy();
            }}
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all cursor-pointer ${
                copied
                    ? "bg-green-50 text-green-600"
                    : "text-muted-foreground/60 hover:text-accent hover:bg-accent/5 border border-border/60 hover:border-accent/30"
            }`}
            aria-label={`コード ${code} をコピー`}
        >
            {copied ? (
                <Check className="w-3 h-3" />
            ) : (
                <Copy className="w-3 h-3" />
            )}
        </button>
    );
}

function DesktopTable({ items }: { items: SearchResult[] }) {
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
                        <th className="text-center px-2 py-3 font-medium text-muted-foreground text-xs w-10">
                            <Heart className="w-3.5 h-3.5 mx-auto text-muted-foreground/40" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((r) => (
                        <tr
                            key={r.id}
                            className="border-b border-border/50 last:border-b-0 hover:bg-muted/40 transition-colors duration-150"
                        >
                            <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">{r.university}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.faculty}</td>
                            <td className="px-4 py-3 text-muted-foreground/70 whitespace-nowrap">{r.department}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.schedule || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.method || "-"}</td>
                            <td className="px-4 py-3 font-mono whitespace-nowrap">
                                <div className="text-accent font-medium mb-1">{r.code}</div>
                                <div className="inline-flex items-center gap-1.5">
                                    <CopyCodeButton code={r.code} />
                                    <FavoriteButton code={r.code} item={r} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MobileCards({ items }: { items: SearchResult[] }) {
    return (
        <div className="md:hidden space-y-3">
            {items.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-popover p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{r.university}</span>
                        <div className="shrink-0 text-right flex items-start gap-2">
                            <FavoriteButton code={r.code} item={r} />
                            <div>
                                <CopyCodeButton code={r.code} />
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1.5">
                        {r.faculty}
                        {r.department ? ` / ${r.department}` : ""}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground/70">
                        <span>日程: {r.schedule || "-"}</span>
                        <span>方式: {r.method || "-"}</span>
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
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-popover text-sm text-muted-foreground font-medium hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 cursor-pointer";

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
                        <DesktopTable items={items} />
                        <MobileCards items={items} />
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
