import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeSearchQuery } from "@/lib/university";
import { SimpleCache } from "@/lib/cache";

const suggestCache = new SimpleCache<string[]>(24 * 60 * 60 * 1000);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const q = normalizeSearchQuery(raw);

  if (!q) {
    return NextResponse.json({ universities: [] });
  }

  const cacheKey = q;
  const cached = suggestCache.get(cacheKey);
  if (cached) return NextResponse.json({ universities: cached });

  try {
    const { rows } = await db.execute({
      sql: `SELECT DISTINCT university FROM university_codes
            WHERE university LIKE ?
            ORDER BY rank, university
            LIMIT 20`,
      args: [`%${q}%`],
    });

    const universities = rows.map(
      (r: Record<string, unknown>) => r.university as string
    );
    suggestCache.set(cacheKey, universities);

    return NextResponse.json(
      { universities },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("Suggest error:", message);
    return NextResponse.json(
      { error: `サジェスト取得に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
