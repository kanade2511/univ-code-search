import { describe, it, expect } from 'bun:test'

/**
 * Test the search matching logic extracted from search/route.ts.
 * These functions mirror the SQL CASE expressions used in the real query.
 */

// Mirror of matchRankSQL / matchTypeSQL logic in TypeScript
function classifyMatch(
    raw: string,
    q: string,
    codeQuery: string,
    row: { university: string; code: string }
): 'exact' | 'code' | 'prefix' | 'partial' {
    const prefixPattern = q + '%'
    const codePrefixPattern = codeQuery + '%'
    const pattern = '%' + q + '%'

    // University exact match
    if (
        row.university === raw ||
        row.university === q ||
        row.university === q + '大学' ||
        row.university === q + '大学校'
    ) {
        return 'exact'
    }

    // Code exact match
    if (row.code === codeQuery || row.code.replace(/-/g, '') === codeQuery) {
        return 'code'
    }

    // Code prefix match
    const codeWithDash = row.code + '-'
    if (
        codeWithDash.includes(prefixPattern.replace(/%/g, '')) ||
        row.code.replace(/-/g, '').startsWith(codePrefixPattern.replace(/%/g, ''))
    ) {
        return 'prefix'
    }

    // University partial match
    if (row.university.includes(pattern.replace(/%/g, ''))) {
        return 'partial'
    }

    return 'partial' // fallback (in SQL it's ELSE)
}

function classifyUnivType(code: string): '国立' | '公立' | '私立' {
    const first = code.charAt(0)
    if (first === '1') return '国立'
    if (first === '2') return '公立'
    if (first === '3') return '私立'
    return '国立' // default (matches SQL ELSE)
}

function buildFilterClause(
    type: string,
    schedule: string,
    faculty: string
): { clause: string; hasFilter: boolean } {
    const parts: string[] = []
    if (type) parts.push(`univ_type = '${type}'`)
    if (schedule) parts.push(`schedule = '${schedule}'`)
    if (faculty) parts.push(`FACULTY_FILTER(${faculty})`) // simplified
    const clause = parts.length > 0 ? 'AND ' + parts.join(' AND ') : ''
    return { clause, hasFilter: parts.length > 0 }
}

describe('match classification', () => {
    const row = { university: '東京大学', code: '1140-91-0010' }

    it('classifies exact match by university name', () => {
        expect(classifyMatch('東京大学', '東京', '東京大学', row)).toBe('exact')
    })

    it('classifies exact match with 大学 suffix completion', () => {
        expect(classifyMatch('東京', '東京', '東京', row)).toBe('exact')
    })

    it('classifies exact match by code (without hyphens)', () => {
        expect(classifyMatch('1140910010', '1140910010', '1140910010', row)).toBe(
            'code'
        )
    })

    it('classifies exact match by code (with hyphens)', () => {
        expect(classifyMatch('1140-91-0010', '1140-91-0010', '1140910010', row)).toBe(
            'code'
        )
    })

    it('classifies prefix match by code', () => {
        expect(classifyMatch('1140', '1140', '1140', row)).toBe('prefix')
    })

    it('classifies prefix match by code without hyphens', () => {
        expect(classifyMatch('114091', '114091', '114091', row)).toBe('prefix')
    })

    it('classifies partial match by university', () => {
        expect(classifyMatch('京大', '京大', '京大', row)).toBe('partial')
    })

    it('classifies as partial when nothing specific matches', () => {
        // Searching for a faculty name gives partial (matched at SQL level)
        const result = classifyMatch('法学部', '法学部', '法学部', {
            university: '東京大学',
            code: '1140-91-0010',
        })
        // Not exact, not code, not prefix, not university partial → partial
        expect(result).toBe('partial')
    })
})

describe('univ_type classification', () => {
    it('classifies 1-xxxxx as 国立', () => {
        expect(classifyUnivType('1140-91-0010')).toBe('国立')
    })

    it('classifies 2-xxxxx as 公立', () => {
        expect(classifyUnivType('2140-91-0010')).toBe('公立')
    })

    it('classifies 3-xxxxx as 私立', () => {
        expect(classifyUnivType('3140-91-0010')).toBe('私立')
    })

    it('defaults to 国立 for unknown first digit', () => {
        expect(classifyUnivType('4140-91-0010')).toBe('国立')
        expect(classifyUnivType('0140-91-0010')).toBe('国立')
    })
})

describe('filter clause building', () => {
    it('returns empty clause when no filters active', () => {
        const { clause, hasFilter } = buildFilterClause('', '', '')
        expect(clause).toBe('')
        expect(hasFilter).toBe(false)
    })

    it('adds type filter', () => {
        const { clause } = buildFilterClause('国立', '', '')
        expect(clause).toContain('univ_type')
        expect(clause).toContain('国立')
    })

    it('adds schedule filter', () => {
        const { clause } = buildFilterClause('', '前', '')
        expect(clause).toContain('schedule')
        expect(clause).toContain('前')
    })

    it('combines multiple filters with AND', () => {
        const { clause, hasFilter } = buildFilterClause('私立', '前', '文系')
        expect(hasFilter).toBe(true)
        expect(clause).toContain('AND')
        expect(clause).toContain('私立')
        expect(clause).toContain('前')
    })
})

describe('edge cases', () => {
    it('empty search query should not match anything as exact', () => {
        const result = classifyMatch('', '', '', {
            university: '東京大学',
            code: '1140-91-0010',
        })
        // Empty query: prefixPattern = '%', codeWithDash.includes('') = true,
        // so prefix check passes. SQL has the same behavior with LIKE '%'.
        // The route handler guards against this with `if (!q) return empty`.
        expect(result).toBe('prefix')
    })

    it('university with old-name notation is matched by LIKE', () => {
        const row = {
            university: 'YIC学院大学 (旧名: 広島女学院大学)',
            code: '3190-91-0010',
        }
        // Searching for the old name should hit partial match
        expect(classifyMatch('広島女学院', '広島女学院', '広島女学院', row)).toBe(
            'partial'
        )
        // Searching for the new name — the exact check fails because
        // the stored name has " (旧名: ...)" suffix, not a pure university name.
        // It correctly falls to partial (university LIKE '%YIC学院大学%' matches).
        expect(classifyMatch('YIC学院大学', 'YIC学院', 'YIC学院大学', row)).toBe(
            'partial'
        )
    })
})
