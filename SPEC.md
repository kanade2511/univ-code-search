# 進研模試 大学コード検索 — 実装仕様書

## 1. 概要

ベネッセ「進研模試／ベネッセ総合学力テスト」で使用される大学学部学科コード（10桁）を検索するためのWebアプリケーション。

- 大学名・コード番号・学部名・学科名から検索可能
- モバイルファースト、シングルページアプリケーション
- Vercel デプロイ前提

---

## 2. 技術スタック

| 要素 | 採用技術 |
|------|---------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript (strict) |
| CSS | Tailwind v4 + `@theme inline`（CSS変数） |
| データベース | Turso (libsql / SQLite互換) |
| アイコン | lucide-react |
| フォント | Geist (Vercel提供、variable font) |
| バンドル | Turbopack（dev）/ Next.js ビルド |
| デプロイ | Vercel |
| 解析 | @vercel/analytics |

**削除された依存関係**: shadcn/ui 関連（@base-ui/react, class-variance-authority, cmdk, shadcn CLI）、clsx/tailwind-merge（未使用の cn() 関数専用）、tw-animate-css（未使用）。

---

## 3. データベース設計

### 3.1 テーブル構成

単一テーブル `university_codes`（23,127行、フラット構造）

```sql
CREATE TABLE university_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  university TEXT NOT NULL,      -- 大学名（旧名表記を含む場合あり）
  faculty TEXT NOT NULL,          -- 学部名
  department TEXT NOT NULL,       -- 学科名
  schedule TEXT NOT NULL,         -- 日程コード（共/前/後/中/他）
  method TEXT NOT NULL,           -- 入試方式
  code TEXT NOT NULL UNIQUE,      -- 10桁コード（XXXX-XX-XXXX）
  rank INTEGER DEFAULT 5,         -- 検索順位（0=最高, 5=最低）
  aliases TEXT NOT NULL DEFAULT ''-- 旧名（APIでは不使用、DB参照用）
);
```

### 3.2 名称変更大学の扱い

2025〜2026年度に名称変更した13大学について、`university` フィールドに直接旧名を併記：

```
昭和医科大学 (旧名: 昭和大学)
YIC学院大学 (旧名: 広島女学院大学)
和泉大学 (旧名: 大阪河崎リハビリテーション大学)
```

これにより `university LIKE` の検索対象が両方の名称をカバーする。

### 3.3 国公立/私立の判定

DBカラムに持たず、SQLのCASE式でコード先頭桁から動的判定：

```sql
CASE
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 1 THEN '国立'
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 2 THEN '公立'
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 3 THEN '私立'
  ELSE '国立'
END
```

### 3.4 ランク設計

| rank | 対象大学 | 行数（参考） |
|------|---------|-------------|
| 0 | 東京一工（東京大・京都大・一橋大・東京科学大） | 52 |
| 1 | 旧帝大・難関国立 | 1,469 |
| 2 | 早慶上理 | 339 |
| 3 | GMARCH + 成成明学獨國武 | 1,781 |
| 4 | 日東駒専 + 産近甲龍 + 他中堅 | 3,071 |
| 5 | その他の大学 | 16,415 |

---

## 4. ディレクトリ構成

```
code-search/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # メインページ（use-searchに委譲）
│   │   ├── layout.tsx               # ルートレイアウト（Geistフォント、ライトテーマ）
│   │   ├── globals.css              # Tailwind v4 + CSS変数定義
│   │   └── api/
│   │       ├── search/route.ts      # GET /api/search
│   │       └── universities/route.ts# GET /api/universities（サジェスト）
│   ├── components/
│   │   ├── suggestion-dropdown.tsx  # 検索入力 + サジェストドロップダウン
│   │   ├── quick-search.tsx         # 初期表示 クイック検索ボタン
│   │   ├── filter-tabs.tsx          # 3段フィルター（区分/学部/日程）
│   │   └── result-list.tsx          # 結果表示（PCテーブル/モバイルカード）
│   └── lib/
│       ├── db.ts                    # Tursoクライアント（@libsql/client）
│       ├── types.ts                 # SearchResult, SearchResponse, DbRow 型定義
│       ├── cache.ts                 # SimpleCache<T> インメモリキャッシュ
│       ├── university.ts            # normalizeSearchQuery（末尾「大学」除去）
│       └── use-search.ts            # カスタムフック（全検索ロジック集約）
├── postcss.config.mjs               # Tailwind v4 PostCSS設定
├── next.config.ts
├── package.json
├── tsconfig.json
├── bun.lock
├── next-env.d.ts
└── .env.local                       # TURSO_DB_URL, TURSO_DB_TOKEN
```

---

## 5. データフロー

```
ユーザー入力
    │
    ▼
use-search（カスタムフック）
    │
    ├─ handleValueChange → 200ms debounce → fetch /api/universities
    │                     400ms debounce → fetch /api/search
    │
    ├─ handleSubmit → 即時 fetch /api/search
    │
    ├─ handleQuickSearch → 即時 fetch /api/search
    │
    ├─ handleClear → 状態リセット + URLクリア
    │
    └─ handleFilterChange → 即時 fetch /api/search（page=1）
            │
            ▼
    APIルート → SimpleCache → Turso → レスポンス
            │
            ▼
    result-list.tsx（グループ別表示）
```

### URL同期

全検索パラメータをURLクエリに保持（`router.replace`、`scroll: false`）。
ページリロード時に URL のパラメータから初期検索を実行。

---

## 6. API

### 6.1 GET /api/search

検索API。クエリに該当する大学コードを返す。

**パラメータ**:

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `q` | 必須 | — | 検索クエリ（大学名・コード・学部名・学科名） |
| `page` | 任意 | 1 | ページ番号 |
| `limit` | 任意 | 50 | 1ページあたり件数（max 200） |
| `type` | 任意 | — | 区分フィルター（国立/公立/私立） |
| `schedule` | 任意 | — | 日程フィルター（前/後/中/共） |
| `faculty` | 任意 | — | 学部系統フィルター（文系/理系/医療系/芸術系/体育系） |

**レスポンス**:

```json
{
  "results": [
    {
      "id": 123,
      "university": "東京大学",
      "faculty": "文科一類",
      "department": "",
      "schedule": "前",
      "method": "一般",
      "code": "1140-91-0010",
      "matchType": "exact",
      "univType": "国立",
      "rank": 0
    }
  ],
  "total": 15,
  "exactCount": 2,
  "codeCount": 1,
  "page": 1,
  "limit": 50
}
```

**キャッシュ**: `Cache-Control: public, s-maxage=86400, stale-while-revalidate=172800`

### 6.2 GET /api/universities

サジェストAPI。入力中の文字列に部分一致する大学名を返す。

**パラメータ**:

| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `q` | 必須 | 部分検索クエリ |

**レスポンス**:

```json
{
  "universities": ["東京大学", "東京科学大学", "東京外国語大学"]
}
```

**キャッシュ**: `Cache-Control: public, s-maxage=86400, stale-while-revalidate=172800`

---

## 7. コンポーネント設計

### 7.1 page.tsx

`useSearch()` フックから状態・関数を受け取り、各コンポーネントを配置。`<Suspense>` でラップ（useSearchParams 要件対応）。

- クエリ未入力 → QuickSearch 表示
- クエリ入力後 → FilterTabs + ResultList 表示 + 「← 戻る」ボタン
- ローディング中 → スピナー表示
- エラー時 → 赤バナー表示
- フッターに出典表記

### 7.2 use-search.ts（カスタムフック）

全検索ロジックを集約。

| 状態/関数 | 説明 |
|----------|------|
| `query` | 現在の検索クエリ文字列 |
| `results` | 検索結果配列 |
| `total` | 総件数 |
| `loading` | ローディング中フラグ |
| `error` | エラーメッセージ文字列 |
| `page` | 現在のページ番号 |
| `totalPages` | 総ページ数（`Math.ceil(total/50)`） |
| `suggestions` | サジェスト大学名配列 |
| `filterState` | `{ type, schedule, faculty }` |
| `handleValueChange(v)` | 入力変更→debounceサジェスト+検索 |
| `handleSubmit()` | 送信（即時検索） |
| `handleQuickSearch(q)` | クイック選択（即時検索） |
| `handleClear()` | 全状態リセット+URLクリア |
| `handleFilterAction(action)` | フィルター変更→即時検索（page=1） |
| `doSearch(q, p, type?, schedule?, faculty?)` | 直接検索呼び出し |

**状態管理**:
- `queryRef` でサジェスト選択時の即時検索が古い値を読む問題を防止
- `searchSeq` / `suggestSeq` で stale レスポンスを破棄
- `searchTimer` / `suggestTimer` で debounce 制御
- マウント時は `initialized` ref で1回のみ初期検索を実行

### 7.3 suggestion-dropdown.tsx

Appleスタイルのヘルパー検索バー。

| 機能 | 実装 |
|------|------|
| レイアウト | Searchアイコン(48x48) + input + クリアボタン(X) + 検索ボタン(ArrowRight) |
| 検索ボタン | sm以上のみ表示（モバイル非表示） |
| サジェスト | ドロップダウン（max-h-72 スクロール） |
| キーボード | Enter（選択/送信）、ArrowUp/Down（フォーカス移動）、Escape（閉じる） |
| マウス | onPointerDown でタップ即座に選択 |
| blur制御 | 200ms setTimeout でドロップダウン内クリックを弾かない |
| 確定防止 | `submitted` ref で送信後のドロップダウン再表示防止 |
| モバイル | `enterKeyHint="search"`, `inputMode="search"` |
| iOS対策 | `text-[16px]` で自動ズーム防止 |

### 7.4 quick-search.tsx

クエリ未入力時にのみ表示。主要大学へのクイックアクセス。

- 国公立: 15校
- 私立: 20校

選択時に即座に検索を実行（handleQuickSearch 経由）。
検索後は非表示（スペース節約）。

### 7.5 filter-tabs.tsx

3段のタブフィルター。型安全（`FilterState` / `FilterAction`）。

| フィルター | 選択肢 |
|-----------|--------|
| 区分（type） | すべて / 国立 / 公立 / 私立 |
| 学部（faculty） | すべて / 文系 / 理系 / 医療系 / 芸術系 / 体育系 |
| 日程（schedule） | すべて / 前期 / 後期 / 中期 / 共テ利用 |

### 7.6 result-list.tsx

結果を matchType 別にグループ表示（exact → code → prefix → partial 順）。

| グループ | ラベル |
|---------|--------|
| `exact` | 完全一致（大学名） |
| `code` | 完全一致（コード） |
| `prefix` | コード前方一致 |
| `partial` | 部分一致 |

- PC: `<table>` 表示（`hidden md:block`）、`whitespace-nowrap`
- モバイル: カード表示（`md:hidden`）、大学名は `truncate` + `min-w-0` で長い場合に `…` 省略
- ページネーション: 「← 前へ / N / M / 次へ →」

---

## 8. 検索ロジック

### 8.1 マッチング種別判定

SQLのCASE式で行う：

```sql
CASE
  WHEN university = ?                        THEN 0  -- exact（大学名完全一致）
  WHEN university = ? || '大学'              THEN 0  -- "東京" → "東京大学"
  WHEN university = ? || '大学校'            THEN 0
  WHEN code = ?                              THEN 1  -- code（コード完全一致）
  WHEN REPLACE(code, '-', '') = ?            THEN 1  -- ハイフンなしでコード一致
  WHEN code || '-' LIKE ?                    THEN 2  -- prefix（コード前方一致）
  WHEN REPLACE(code, '-', '') LIKE ?         THEN 2
  WHEN university LIKE ?                     THEN 3  -- partial（大学名LIKE）
  ELSE 4
END
```

`match_type` も同様のCASE式で `exact` / `code` / `prefix` / `partial` を判定。

**クエリ正規化**: `normalizeSearchQuery()` で末尾の「大学」「大」を除去。
ただし元データの大学名には「大学」が含まれているため、一致判定は元の文字列と除去後の両方で行う。

### 8.2 ハイフンなしコード対応

コード `1140-91-0010` と `1140910010` の両方の入力形式に対応：
- `raw.replace(/-/g, "")` でハイフンを除去した文字列をコード検索に使用
- `REPLACE(code, '-', '')` でDB側でもハイフン除去して比較
- 前方一致も同様にハイフンなしで効く（例: `114091` → `1140-91-xxxx` にマッチ）

### 8.3 名称変更大学の検索

大学名に `(旧名: XXX)` が含まれているため、`university LIKE` で旧名でもヒットする。
例: 「広島女学院」→ `YIC学院大学 (旧名: 広島女学院大学)` がマッチ。

### 8.4 フィルター条件

学部フィルターはプリセットのLIKE条件：

| 系統 | LIKE条件 |
|------|---------|
| 文系 | `faculty LIKE '%文%' OR '%法%' OR '%経済%' OR '%経営%' OR '%社会%' OR '%外国語%' OR '%国際%' OR '%コミュニケーション%' OR '%英語%' OR '%心理%' OR '%人間%' OR '%教育%' OR '%神学%' OR '%学芸%' OR '%教養%'` |
| 理系 | `faculty LIKE '%理%' OR '%工%' OR '%情報%' OR '%建築%' OR '%農%' OR '%獣医%' OR '%生物%' OR '%化学%' OR '%物理%' OR '%環境%' OR '%理工%' OR '%人間%' OR '%教育%'` |
| 医療系 | `faculty LIKE '%医%' OR '%歯%' OR '%薬%' OR '%看護%' OR '%保健%' OR '%医療%' OR '%リハ%'` |
| 芸術系 | `faculty LIKE '%芸術%' OR '%音楽%' OR '%美術%' OR '%デザイン%' OR '%造形%' OR '%映画%'` |
| 体育系 | `faculty LIKE '%体育%' OR '%スポーツ%'` |

**教育学部・人間科学部**は文系/理系両方に含める（学部によって文理が異なるため）。

### 8.5 ソート順

```sql
ORDER BY match_rank, rank, university, faculty, department
```

matchType グループ順 → 大学ランク順 → 大学名 → 学部名 → 学科名

---

## 9. キャッシュ戦略

### 9.1 SimpleCache（サーバーサイド・インメモリ）

汎用キャッシュクラス:

```typescript
class SimpleCache<T> {
  private store: Map<string, { data: T; expiry: number }>;
  constructor(ttlMs: number = 5 * 60 * 1000);
  get(key: string): T | undefined;   // 有効期限内ならデータ返却、期限切れならdelete
  set(key: string, data: T): void;
  clear(): void;
  get size(): number;
}
```

| API | キャッシュキー | TTL |
|-----|--------------|-----|
| `/api/search` | `q|type|schedule|faculty|page` | 24時間 |
| `/api/universities` | `q` | 24時間 |

### 9.2 CDNキャッシュ

両APIとも Edge Networkに24時間キャッシュ：
`Cache-Control: public, s-maxage=86400, stale-while-revalidate=172800`

---

## 10. UI/UX 設計

### 10.1 カラーパレット

CSS変数（`@theme inline` で定義）：

| 変数 | 値 | 用途 |
|------|-----|------|
| `--color-background` | `oklch(97% 0.003 250)` | ページ背景（薄いグレー） |
| `--color-surface` | `oklch(100% 0 0)` | カード/div背景 |
| `--color-foreground` | `oklch(18% 0.012 250)` | テキスト色 |
| `--color-accent` | `#4a6fa5` | アクセントカラー（青） |
| `--color-muted-foreground` | `oklch(52% 0.012 250)` | サブテキスト |
| `--color-border` | `oklch(90% 0.006 250)` | 枠線 |
| `--color-hover` | `oklch(95% 0.008 250)` | ホバー背景 |

ライトテーマ固定（ダークモードなし）。

### 10.2 レスポンシブデザイン

| ブレークポイント | 表示切り替え |
|-----------------|-------------|
| デフォルト（モバイル） | カード表示 + 検索ボタン非表示 |
| `sm` (640px) | 検索ボタン表示 |
| `md` (768px) | テーブル表示 + カード非表示 |
| `max-w-4xl` | コンテンツ最大幅（~896px） |

### 10.3 モバイル対応ポイント

- input に `text-[16px]`（iOS自動ズーム防止）
- `enterKeyHint="search"` でキーボードリターンキーに「検索」
- `type="text"` で独自クリアボタン（`type="search"` にするとChromeのネイティブ×と重複）
- autofocus不使用（スマホでキーボード自動表示を防止）
- `onPointerDown` でタップ即座にサジェスト選択
- `onBlur` に200ms遅延（ドロップダウン内クリックを弾かない）
- 検索ボタンは640px以上でのみ表示（モバイルはEnterキーで送信）
- モバイルカードの大学名: `truncate` + `min-w-0` で長い場合に `…` 省略

### 10.4 アニメーション・トランジション

| 要素 | 効果 |
|------|------|
| タブ切り替え | `active:scale-95`（押し込み感） |
| 検索バー | `focus-within:shadow-[0_8px_24px_rgba(74,111,165,0.10)]` |
| 検索バー周辺 | radial-gradient glow |
| 結果行ホバー | `hover:bg-muted/40`、150ms transition |
| スピナー | `animate-spin` |
| クイック検索ボタン | `active:scale-[0.97]`、ホバーで枠線変更 |

---

## 11. 型定義

```typescript
// APIレスポンスの1行分
type SearchResult = {
  id: number;
  university: string;    // "YIC学院大学 (旧名: 広島女学院大学)"
  faculty: string;
  department: string;
  schedule: string;
  method: string;
  code: string;          // "XXXX-XX-XXXX" 形式
  matchType: string;     // "exact" | "code" | "prefix" | "partial"
  univType: string;      // "国立" | "公立" | "私立"
  rank: number;          // 0-5
};

// /api/search のレスポンス全体
type SearchResponse = {
  results: SearchResult[];
  total: number;
  exactCount: number;
  codeCount: number;
  page: number;
  limit: number;
};

// DBの生行（ASで計算カラムが追加される）
type DbRow = {
  id: number;
  university: string;
  faculty: string;
  department: string;
  schedule: string;
  method: string;
  code: string;
  rank: number;
  match_rank: number;   // SQLのCASE式結果
  match_type: string;   // SQLのCASE式結果
  univ_type: string;    // SQLのCASE式結果
};

// クイック検索ボタン
type QuickSearchItem = {
  label: string;  // 表示ラベル（例: "東京大"）
  query: string;  // 検索クエリ（例: "東京大学"）
};
```

---

## 12. データの注意事項

### 12.1 元データ由来の特性

- **日程なし・方式あり**: 1,267行 → 方式カラムに日程情報が内包（「Ⅰ期」「前期」「中期」など）
- **日程・方式両方なし**: 103行 → 8桁コード相当（模試の回によって使われる）
- **入試方式の表記ゆれ**: 978種類（「Ⅰ期」「Ⅰ期１」「前期３」「Ａ」「前期Ａ」「併用」など統一ルールなし）
- **大学名**: 全行が省略形（正式名称とのマッピングなし）
- **学科名**: スラッグ区切りで専攻情報を含む、全角スペース混入

### 12.2 開発判断

- **DB正規化しない**: 23K行ではJOINよりフラットテーブルが実用的。年度更新の簡便さ優先
- **FTS5よりLIKE検索**: 23K行なら全件スキャンで十分。コード `1140-91-0010` をFTSトークナイザが正しく扱える保証がない
- **shadcn/ui不使用**: Popover+Commandの二重入力がスマホで使いづらい。独自のinput+サジェストドロップダウン
- **キャッシュ長め**: データ更新頻度が低いためCDNエッジキャッシュでコスト削減
- **名称変更はuniiversity名に直接旧名併記**: aliases カラムもDBに存在するがAPIでは使用せず、`university LIKE` で両方の名称を検索可能にする方式
- **ハイフンはDBに保持**: 表示用フォーマットは `XXXX-XX-XXXX` のまま、検索時に `REPLACE` でハイフン除去比較
