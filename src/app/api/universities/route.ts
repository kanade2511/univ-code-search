import { NextRequest, NextResponse } from 'next/server'
import { suggest } from '@/lib/search'
import { SimpleCache } from '@/lib/cache'

const suggestCache = new SimpleCache<string[]>(24 * 60 * 60 * 1000)

export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get('q')?.trim() ?? ''

    if (!raw) {
        return NextResponse.json({ universities: [] })
    }

    const cacheKey = raw
    const cached = suggestCache.get(cacheKey)
    if (cached) return NextResponse.json({ universities: cached })

    try {
        const universities = suggest(raw)
        suggestCache.set(cacheKey, universities)

        return NextResponse.json(
            { universities },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
                },
            }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : '不明なエラー'
        console.error('Suggest error:', message)
        return NextResponse.json(
            { error: `サジェスト取得に失敗しました: ${message}` },
            { status: 500 }
        )
    }
}
