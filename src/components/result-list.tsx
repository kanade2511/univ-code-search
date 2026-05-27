"use client";

import type { SearchResult } from "@/lib/types";

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

function DesktopTable({ items }: { items: SearchResult[] }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs">大学</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs">学部</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs">学科</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs">日程</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs">方式</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs font-mono">コード</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{r.university}</td>
              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.faculty}</td>
              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.department}</td>
              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.schedule || "-"}</td>
              <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{r.method || "-"}</td>
              <td className="px-3 py-2.5 font-mono text-[#4a6fa5] font-medium whitespace-nowrap">{r.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({ items }: { items: SearchResult[] }) {
  return (
    <div className="md:hidden space-y-2">
      {items.map((r) => (
        <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{r.university}</span>
            <span className="shrink-0 font-mono text-xs text-[#4a6fa5]">{r.code}</span>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            {r.faculty}{r.department ? ` / ${r.department}` : ""}
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>日程: {r.schedule || "-"}</span>
            <span>方式: {r.method || "-"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: Pick<Props, "page" | "totalPages" | "onPageChange">) {
  if (totalPages <= 1) return null;

  const btn =
    "px-3 py-1 rounded border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white";

  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={btn}>
        前へ
      </button>
      <span className="text-gray-400 text-xs">{page} / {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={btn}>
        次へ
      </button>
    </div>
  );
}

export function ResultList({ results, total, page, totalPages, onPageChange }: Props) {
  if (results.length === 0) return null;

  return (
    <>
      {(["exact", "code", "prefix", "partial"] as const).map((group) => {
        const items = results.filter((r) => r.matchType === group);
        if (items.length === 0) return null;

        return (
          <div key={group} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-400">{GROUP_LABELS[group]}</span>
              <span className="text-xs text-gray-300">({items.length})</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <DesktopTable items={items} />
            <MobileCards items={items} />
          </div>
        );
      })}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
