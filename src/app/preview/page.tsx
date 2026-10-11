"use client";

import { useState } from "react";
import {
  Search,
  Bookmark,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  X,
  History,
  Sparkles,
  SearchX,
  ExternalLink,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                SAMPLE DATA                                 */
/* -------------------------------------------------------------------------- */
const SAMPLE_BOOKMARKS = [
  {
    university: "東京大学",
    code: "1101-01",
    univType: "国立",
    faculty: "文科一類",
  },
  {
    university: "早稲田大学",
    code: "3310-02",
    univType: "私立",
    faculty: "法学部",
  },
];

const SAMPLE_RESULTS = [
  {
    university: "早稲田大学",
    faculty: "法学部",
    department: "法律学科",
    schedule: "一般",
    method: "一般選抜",
    code: "3310-02",
  },
  {
    university: "早稲田大学",
    faculty: "政治経済学部",
    department: "政治学科",
    schedule: "一般",
    method: "共通テスト併用",
    code: "3310-01",
  },
];

/* -------------------------------------------------------------------------- */
/*                       BEFORE COMPONENTS (現状のUI)                          */
/* -------------------------------------------------------------------------- */
function BeforeSection() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = (code: string) => {
    setCopied(code);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="space-y-8 p-6 rounded-2xl border border-red-200/80 bg-red-50/10 relative">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" />
        BEFORE (現状のUI · 監査で指摘された点)
      </div>

      {/* 1. Centered Hero with Radial Gradient Glow */}
      <div className="relative pt-4 pb-2 text-center">
        {/* Glow behind hero (Tell: Aurora-blob / Radial-gradient) */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            inset: "-20px -30px 0px",
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(74,111,165,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 block mb-1">
            ⚠️ 指摘: 全体中央揃え + 背面ラジアルグラデーション
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            進研模試 大学コード検索
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            大学名・コード番号から10桁の大学学部学科コードを検索
          </p>

          <div className="mt-4 max-w-md mx-auto relative flex items-center bg-white border border-border rounded-[14px] shadow-sm">
            <span className="grid place-items-center w-10 h-10 text-muted-foreground shrink-0">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              readOnly
              value="早稲田 法"
              className="flex-1 bg-transparent text-sm outline-none py-2 pr-2"
            />
            <button className="mr-1.5 px-3 py-1.5 rounded-[10px] bg-[#4a6fa5] text-white text-xs font-semibold">
              検索
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bookmarks with Hover-only Delete & Non-token yellow/red */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          {/* Non-token yellow */}
          <Bookmark className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            ブックマーク
          </span>
          <span className="text-[10px] text-red-600 font-mono">
            ⚠️ 指摘: 削除ボタンがPCホバー限定 (モバイル非表示)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_BOOKMARKS.map((f) => (
            <div
              key={f.code}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-white group cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground truncate">
                  {f.university}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {f.code} · {f.faculty}
                </div>
              </div>
              {/* Tell: opacity-0 group-hover:opacity-100 */}
              <button
                className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="PCでカーソルを乗せないと見えないボタン"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Results Table & Celebratory Floating Toast */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            検索結果
          </span>
          <span className="text-[10px] text-red-600 font-mono">
            ⚠️ 指摘: コピー時に画面下に大きな浮遊トースト出現
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-white text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2">大学</th>
                <th className="px-3 py-2">学部</th>
                <th className="px-3 py-2">コード (クリックでコピー)</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_RESULTS.map((r) => (
                <tr key={r.code} className="border-b border-border/50 last:border-b-0">
                  <td className="px-3 py-2 font-medium">{r.university}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.faculty}</td>
                  <td className="px-3 py-2 font-mono">
                    <button
                      onClick={() => handleCopy(r.code)}
                      className="inline-flex items-center gap-1.5 text-[#4a6fa5] hover:underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                      {r.code}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Floating Toast Simulator */}
        {showToast && (
          <div className="mt-3 p-2 bg-gray-900 text-white text-xs rounded-full shadow-lg text-center animate-bounce max-w-[220px] mx-auto">
            コピーしました: {copied}
          </div>
        )}
      </div>

      {/* 4. Zero Result Recovery with Sparkles Icon */}
      <div className="pt-2">
        <span className="text-[10px] text-red-600 font-mono block mb-1">
          ⚠️ 指摘: AIテンプレ特有の「Sparkles (✨キラキラ)」アイコン + 均等グリッド
        </span>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2 mb-2 text-xs">
            <SearchX className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              該当なし
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-blue-900">
              {/* Tell: Sparkles icon as AI shortcut */}
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>もしかして：「早稲田」で再検索？</span>
            </div>
            <button className="px-2 py-1 rounded bg-[#4a6fa5] text-white text-[11px]">
              再検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        AFTER COMPONENTS (Hallmark改善後)                    */
/* -------------------------------------------------------------------------- */
function AfterSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [queryValue, setQueryValue] = useState("早稲田 法");

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="space-y-8 p-6 rounded-2xl border border-emerald-300/80 bg-emerald-50/15 relative">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        AFTER (Hallmark 改善適用後 · Anti-AI-slop)
      </div>

      {/* 1. Asymmetric Editorial Hero (Solid Surface, No Glow, Exact Search Box Size & Shape Preserved) */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-muted-foreground/90 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              BENESSE UNIV-CODE DIRECTORY · 2026
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-[-0.03em] text-foreground font-sans">
              進研模試 大学コード検索
            </h2>
          </div>
          <div className="text-xs text-muted-foreground/80 sm:text-right font-mono">
            収録数 23,127 件 / 全789大学
          </div>
        </div>

        {/* Search wrap — exact size & shape preserved (14px radius, 48px icon, py-3 input, 10px button) */}
        <div className="mt-4 relative flex items-center bg-popover border border-border rounded-[14px] shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(74,111,165,0.10)]">
          <span className="grid place-items-center w-12 h-12 flex-shrink-0 text-muted-foreground" aria-hidden="true">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
            className="flex-1 border-0 bg-transparent text-[16px] md:text-lg text-foreground placeholder:text-muted-foreground/60 outline-none py-3 pr-2 font-medium"
            placeholder="大学名またはコードを入力"
          />
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 mr-1.5 my-1.5 px-[18px] py-[10px] border-0 rounded-[10px] bg-accent text-accent-foreground text-sm font-semibold cursor-pointer transition-colors duration-150 hover:brightness-90 active:scale-[0.98]"
          >
            <ArrowRight className="h-4 w-4" />
            検索
          </button>
        </div>
      </div>

      {/* 2. Bookmarks with Accessible Affordance & Semantic Token */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-accent fill-accent/20" />
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              ブックマーク
            </span>
            <span className="text-[11px] text-muted-foreground/60 font-mono">(2)</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            ✓ 削除ボタン常時認識可能（タッチ対応）
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_BOOKMARKS.map((f) => (
            <div
              key={f.code}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-surface/90 hover:border-accent/40 transition-colors duration-150 cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-foreground truncate">
                  {f.university}
                </div>
                <div className="text-[11px] text-muted-foreground/75 font-mono">
                  {f.code} · <span className="font-sans">{f.faculty}</span>
                </div>
              </div>
              {/* Hallmark Fix: Visible with subtle opacity, accessible on touch */}
              <button
                className="shrink-0 p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                aria-label={`${f.university} を削除`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Results Table with Inline Copy Feedback (No Floating Toast) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            検索結果（2件）
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">
            ✓ インライン即時フィードバック（静かな品格）
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/80 bg-surface text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/25 border-b border-border/60 text-muted-foreground font-medium">
              <tr>
                <th className="px-3.5 py-2.5">大学</th>
                <th className="px-3.5 py-2.5">学部</th>
                <th className="px-3.5 py-2.5">コード</th>
                <th className="px-3 py-2.5 text-right">資料</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {SAMPLE_RESULTS.map((r) => {
                const isCopied = copiedCode === r.code;
                return (
                  <tr key={r.code} className="hover:bg-muted/15 transition-colors duration-100">
                    <td className="px-3.5 py-2.5 font-medium text-foreground">
                      {r.university}
                    </td>
                    <td className="px-3.5 py-2.5 text-muted-foreground">
                      {r.faculty}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <button
                        onClick={() => handleCopy(r.code)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded font-mono font-medium transition-colors cursor-pointer ${
                          isCopied
                            ? "bg-emerald-100 text-emerald-800"
                            : "hover:bg-accent/10 text-accent"
                        }`}
                        title="クリックでコピー"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>{r.code}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-muted-foreground/40" />
                            <span>{r.code}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-accent cursor-pointer">
                        パスナビ
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Zero Result Recovery without Sparkles (Typographic Distinction) */}
      <div className="pt-2">
        <span className="text-[11px] text-emerald-700 font-medium block mb-1">
          ✓ AIアイコン（キラキラ）を廃止し、論理的なタイポグラフィで再構成
        </span>
        <div className="rounded-xl border border-border/80 bg-surface p-4">
          <div className="flex items-center gap-2 mb-2 text-xs">
            <SearchX className="w-4 h-4 text-muted-foreground/70" />
            <span className="font-semibold text-foreground">
              該当するコードが見つかりません
            </span>
          </div>
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-foreground leading-relaxed">
              もしかして：
              <button
                type="button"
                onClick={() => setQueryValue("早稲田")}
                className="font-bold text-accent hover:text-accent/80 underline underline-offset-4 decoration-accent/40 hover:decoration-accent cursor-pointer transition-colors px-1 py-0.5 rounded-sm hover:bg-accent/10 active:scale-95"
                title="クリックで検索欄に「早稲田」を入力"
              >
                「早稲田」
              </button>
              で探していませんか？
            </div>
            <button
              type="button"
              onClick={() => setQueryValue("早稲田")}
              className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-xs font-medium hover:brightness-95 transition-colors cursor-pointer"
            >
              「早稲田」で再検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN PAGE                                    */
/* -------------------------------------------------------------------------- */
export default function PreviewPage() {
  const [viewMode, setViewMode] = useState<"split" | "before" | "after">("split");

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-accent uppercase tracking-wider mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              HALLMARK DESIGN AUDIT · LIVE COMPARISON
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Before / After デザイン改善プレビュー
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hallmark が指摘した AIスロップ（Anti-patterns）と、改善後の洗練されたUIの比較
            </p>
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-popover hover:bg-muted/40 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground shrink-0 w-fit"
          >
            ← 実際の検索アプリへ戻る
          </a>
        </div>

        {/* View Mode Switcher */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1 font-medium">表示モード:</span>
          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "split"
                ? "bg-foreground text-background"
                : "bg-popover border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            左右に並べて比較 (Split View)
          </button>
          <button
            onClick={() => setViewMode("before")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "before"
                ? "bg-red-600 text-white"
                : "bg-popover border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Before のみ (現状の課題)
          </button>
          <button
            onClick={() => setViewMode("after")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              viewMode === "after"
                ? "bg-emerald-600 text-white"
                : "bg-popover border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            After のみ (Hallmark適用後)
          </button>
        </div>
      </div>

      {/* Main Comparison Container */}
      <div
        className={
          viewMode === "split"
            ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            : "max-w-3xl mx-auto"
        }
      >
        {(viewMode === "split" || viewMode === "before") && <BeforeSection />}
        {(viewMode === "split" || viewMode === "after") && <AfterSection />}
      </div>

      {/* Audit Scorecard / Detailed Fix Table */}
      <div className="mt-14 pt-8 border-t border-border">
        <h3 className="text-base font-bold text-foreground mb-4">
          Hallmark 監査項目・対比チェックリスト
        </h3>
        <div className="overflow-hidden rounded-xl border border-border bg-popover text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">重要度</th>
                <th className="px-4 py-3">指摘項目 (Tell)</th>
                <th className="px-4 py-3">Before (現状)</th>
                <th className="px-4 py-3">After (Hallmark 解決策)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold font-mono">
                    CRITICAL
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Radial-gradient Glow</td>
                <td className="px-4 py-3 text-muted-foreground">
                  検索窓背面に青紫のインラインラジアル光彩（AIテンプレ特有）
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  光彩を全撤去。背景色と表面のソリッドな階調差で品位を保つ
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold font-mono">
                    CRITICAL
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Hover-only Delete</td>
                <td className="px-4 py-3 text-muted-foreground">
                  ブックマークの削除ボタンがPCホバー限定でモバイルから消える
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  透過度40%で常時薄く表示し、タッチ操作で確実に削除可能に
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold font-mono">
                    CRITICAL
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Centred Everything</td>
                <td className="px-4 py-3 text-muted-foreground">
                  全要素が画面中央一列に並び、対称的で無機質
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  アシンメトリーなタイポグラフィとメタデータの配置で視線誘導
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                    MAJOR
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Sparkles Icon (✨)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  0件時の「もしかして」にAI記号のキラキラアイコンを使用
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  キラキラアイコンを廃止し、アンダーラインのタイポグラフィで強調
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                    MAJOR
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Celebratory Toast</td>
                <td className="px-4 py-3 text-muted-foreground">
                  コードコピー時に画面下部に黒い浮遊トーストが跳ねる
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  コピーボタン自身が一時的にチェックに変わる静かなインライン表示
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono">
                    MAJOR
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">Indiscriminate transition-all</td>
                <td className="px-4 py-3 text-muted-foreground">
                  レイアウト再計算を起こす `transition-all` の一律指定
                </td>
                <td className="px-4 py-3 text-emerald-700 font-medium">
                  `transition-colors`, `transition-transform` など限定プロパティに絞る
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
