import { loadRows, getUniversities } from './data'
import { normalizeSearchQuery } from './university'
import { classifyMatch, textMatches, univType, FACULTY_PATTERNS, type MatchClass } from './match'
import type { CodeRow } from './data'

export type MatchResult = {
    id: number
    university: string
    faculty: string
    department: string
    schedule: string
    method: string
    code: string
    matchType: MatchClass['type']
    univType: ReturnType<typeof univType>
    rank: number
}

type SearchParams = {
    q: string
    type?: string
    schedule?: string
    faculty?: string
    page: number
    limit: number
}

export type SearchOutput = {
    results: MatchResult[]
    total: number
    page: number
    limit: number
}

type Classified = CodeRow & { matchRank: number; matchType: MatchClass['type']; univType: ReturnType<typeof univType> }

const CODE_HYPHEN = /-/g

export function search(params: SearchParams): SearchOutput {
    const raw = params.q.trim()
    const q = normalizeSearchQuery(raw)
    const codeQuery = raw.replace(CODE_HYPHEN, '')
    const rows = loadRows()

    if (!q) {
        return { results: [], total: 0, page: params.page, limit: params.limit }
    }

    let filtered = rows
    if (params.type) {
        filtered = filtered.filter((r) => univType(r.code) === params.type)
    }
    if (params.schedule) {
        filtered = filtered.filter((r) => r.schedule === params.schedule)
    }
    if (params.faculty && FACULTY_PATTERNS[params.faculty]) {
        const re = FACULTY_PATTERNS[params.faculty]
        filtered = filtered.filter((r) => re.test(r.faculty))
    }

    const matched = filtered.filter((r) => textMatches(q, codeQuery, r))

    const classified: Classified[] = matched.map((r) => {
        const m = classifyMatch(raw, q, codeQuery, r)
        return { ...r, matchRank: m.rank, matchType: m.type, univType: univType(r.code) }
    })

    classified.sort((a, b) => {
        if (a.matchRank !== b.matchRank) return a.matchRank - b.matchRank
        if (a.rank !== b.rank) return a.rank - b.rank
        const u = a.university.localeCompare(b.university)
        if (u !== 0) return u
        const f = a.faculty.localeCompare(b.faculty)
        if (f !== 0) return f
        return a.department.localeCompare(b.department)
    })

    const total = classified.length
    const offset = (params.page - 1) * params.limit
    const results: MatchResult[] = classified
        .slice(offset, offset + params.limit)
        .map(({ matchRank: _, ...rest }) => rest)

    return { results, total, page: params.page, limit: params.limit }
}

export function suggest(q: string): string[] {
    if (!q.trim()) return []
    const normalized = normalizeSearchQuery(q.trim())
    if (!normalized) return []
    const universities = getUniversities()
    return universities.filter((u) => u.includes(normalized)).slice(0, 20)
}
