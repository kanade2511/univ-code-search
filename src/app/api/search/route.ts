import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeSearchQuery } from "@/lib/university";
import type { DbRow, SearchResponse } from "@/lib/types";
import { SimpleCache } from "@/lib/cache";

const searchCache = new SimpleCache<SearchResponse>(24 * 60 * 60 * 1000);

const UNIV_TYPE_SQL = `CASE
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 1 THEN '国立'
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 2 THEN '公立'
  WHEN CAST(SUBSTR(code, 1, 1) AS INTEGER) = 3 THEN '私立'
  ELSE '国立'
END`;

const FACULTY_FILTERS: Record<string, string> = {
  文系: `(faculty LIKE '%文%' OR faculty LIKE '%法%' OR faculty LIKE '%経済%' OR faculty LIKE '%経営%'
     OR faculty LIKE '%社会%' OR faculty LIKE '%外国語%' OR faculty LIKE '%国際%'
     OR faculty LIKE '%コミュニケーション%' OR faculty LIKE '%英語%' OR faculty LIKE '%心理%'
     OR faculty LIKE '%人間%' OR faculty LIKE '%教育%' OR faculty LIKE '%神学%' OR faculty LIKE '%学芸%'
     OR faculty LIKE '%教養%')`,
  理系: `(faculty LIKE '%理%' OR faculty LIKE '%工%' OR faculty LIKE '%情報%' OR faculty LIKE '%建築%'
     OR faculty LIKE '%農%' OR faculty LIKE '%獣医%' OR faculty LIKE '%生物%' OR faculty LIKE '%化学%'
     OR faculty LIKE '%物理%' OR faculty LIKE '%環境%' OR faculty LIKE '%理工%'
     OR faculty LIKE '%人間%' OR faculty LIKE '%教育%')`,
  医療系: `(faculty LIKE '%医%' OR faculty LIKE '%歯%' OR faculty LIKE '%薬%' OR faculty LIKE '%看護%'
       OR faculty LIKE '%保健%' OR faculty LIKE '%医療%' OR faculty LIKE '%リハ%')`,
  芸術系: `(faculty LIKE '%芸術%' OR faculty LIKE '%音楽%' OR faculty LIKE '%美術%'
       OR faculty LIKE '%デザイン%' OR faculty LIKE '%造形%' OR faculty LIKE '%映画%')`,
  体育系: `(faculty LIKE '%体育%' OR faculty LIKE '%スポーツ%')`,
};

function matchRankSQL(): string {
  return `CASE
    WHEN university = ? THEN 0 WHEN university = ? THEN 0
    WHEN university = ? || '大学' THEN 0 WHEN university = ? || '大学校' THEN 0
    WHEN code = ? THEN 1
    WHEN REPLACE(code, '-', '') = ? THEN 1
    WHEN code || '-' LIKE ? THEN 2
    WHEN REPLACE(code, '-', '') LIKE ? THEN 2
    WHEN university LIKE ? THEN 3
    ELSE 4
  END`;
}

function matchTypeSQL(): string {
  return `CASE
    WHEN university = ? THEN 'exact' WHEN university = ? THEN 'exact'
    WHEN university = ? || '大学' THEN 'exact' WHEN university = ? || '大学校' THEN 'exact'
    WHEN code = ? THEN 'code'
    WHEN REPLACE(code, '-', '') = ? THEN 'code'
    WHEN code || '-' LIKE ? THEN 'prefix'
    WHEN REPLACE(code, '-', '') LIKE ? THEN 'prefix'
    ELSE 'partial'
  END`;
}

const CODE_HYPHEN_PATTERN = /-/g;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const q = normalizeSearchQuery(raw);
  const type = request.nextUrl.searchParams.get("type") ?? "";
  const schedule = request.nextUrl.searchParams.get("schedule") ?? "";
  const facultyType = request.nextUrl.searchParams.get("faculty") ?? "";
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "50"), 200);
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ results: [], total: 0, exactCount: 0, codeCount: 0, page, limit });
  }

  const cacheKey = `${q}|${type}|${schedule}|${facultyType}|${page}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Strip hyphens for code-only matching (support both "1005-55-0110" and "1005550110")
    const codeQuery = raw.replace(CODE_HYPHEN_PATTERN, "");
    const pattern = `%${q}%`;
    const prefixPattern = `${q}%`;
    const codePattern = `%${codeQuery}%`;
    const codePrefixPattern = `${codeQuery}%`;
    const baseArgs = [pattern, pattern, pattern, pattern, codePattern];

    // Build filter clauses
    const parts: string[] = [];
    const filterArgs: string[] = [];
    if (type) {
      parts.push(`${UNIV_TYPE_SQL} = ?`);
      filterArgs.push(type);
    }
    if (schedule) {
      parts.push("schedule = ?");
      filterArgs.push(schedule);
    }
    if (facultyType && FACULTY_FILTERS[facultyType]) {
      parts.push(FACULTY_FILTERS[facultyType]);
    }
    const filterClause = parts.length > 0 ? "AND " + parts.join(" AND ") : "";

    const { rows: countRows } = await db.execute({
      sql: `SELECT COUNT(*) as cnt FROM university_codes
            WHERE (university LIKE ? OR code LIKE ? OR faculty LIKE ? OR department LIKE ? OR REPLACE(code, '-', '') LIKE ?)
            ${filterClause}`,
      args: [...baseArgs, ...filterArgs],
    });
    const total = Number((countRows[0] as Record<string, unknown>).cnt ?? 0);

    const { rows } = await db.execute({
      sql: `SELECT *, ${UNIV_TYPE_SQL} as univ_type,
            ${matchRankSQL()} as match_rank, ${matchTypeSQL()} as match_type
            FROM university_codes
            WHERE (university LIKE ? OR code LIKE ? OR faculty LIKE ? OR department LIKE ? OR REPLACE(code, '-', '') LIKE ?)
            ${filterClause}
            ORDER BY match_rank, rank, university, faculty, department
            LIMIT ? OFFSET ?`,
      args: [
        raw, q, q, q, q, prefixPattern, pattern, codeQuery, codePrefixPattern,
        raw, q, q, q, q, prefixPattern, codeQuery, codePrefixPattern,
        ...baseArgs, ...filterArgs,
        limit, offset,
      ],
    });

    const results = (rows as unknown as DbRow[]).map((r) => ({
      id: r.id,
      university: r.university,
      faculty: r.faculty,
      department: r.department,
      schedule: r.schedule,
      method: r.method,
      code: r.code,
      matchType: r.match_type,
      univType: r.univ_type,
      rank: r.rank,
    }));

    const json = {
      results,
      total,
      exactCount: results.filter((r) => r.matchType === "exact").length,
      codeCount: results.filter((r) => r.matchType === "code").length,
      page,
      limit,
    };
    searchCache.set(cacheKey, json);
    return NextResponse.json(json, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("Search error:", message);
    return NextResponse.json(
      { error: `検索に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
