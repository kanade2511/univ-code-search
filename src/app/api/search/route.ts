import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/search'
import { SimpleCache } from '@/lib/cache'
import type { SearchOutput } from '@/lib/search'

const searchCache = new SimpleCache<SearchOutput>(24 * 60 * 60 * 1000)

export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const type = request.nextUrl.searchParams.get('type') ?? ''
    const schedule = request.nextUrl.searchParams.get('schedule') ?? ''
    const faculty = request.nextUrl.searchParams.get('faculty') ?? ''
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1'))
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '50'), 200)

    const cacheKey = `${raw}|${type}|${schedule}|${faculty}|${page}`
    const cached = searchCache.get(cacheKey)
    if (cached) return NextResponse.json(cached)

    try {
        const json = search({ q: raw, type, schedule, faculty, page, limit })
        searchCache.set(cacheKey, json)
        return NextResponse.json(json, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : '不明なエラー'
        console.error('Search error:', message)
        return NextResponse.json(
            { error: `検索に失敗しました: ${message}` },
            { status: 500 }
        )
    }
}
