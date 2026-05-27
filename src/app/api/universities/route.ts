import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeSearchQuery } from "@/lib/university";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const q = normalizeSearchQuery(raw);

  if (!q) {
    return NextResponse.json({ universities: [] });
  }

  try {
    const { rows } = await db.execute({
      sql: `SELECT DISTINCT university FROM university_codes
            WHERE university LIKE ?
            ORDER BY rank, university
            LIMIT 20`,
      args: [`%${q}%`],
    });

    return NextResponse.json({
      universities: (rows as any[]).map((r) => r.university as string),
    });
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json(
      { error: "サジェスト取得に失敗しました" },
      { status: 500 }
    );
  }
}
