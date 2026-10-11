import type { CodeRow } from './data'
import { getUniversityAlias } from './aliases'
import { getUniversitiesInGroup } from './groups'
import { fullwidthToHalfwidth, normalizeSearchQuery, splitQueryTokens } from './university'

const CODE_HYPHEN = /-/g

export function univType(code: string): '国立' | '公立' | '私立' {
    const first = code.charAt(0)
    if (first === '1') return '国立'
    if (first === '2') return '公立'
    if (first === '3') return '私立'
    return '国立'
}

export type MatchClass = { rank: number; type: 'exact' | 'code' | 'prefix' | 'partial' }

/**
 * Check if a single token matches a row across university, faculty, department, code, method, or schedule.
 */
export function singleTokenMatches(token: string, r: CodeRow): boolean {
    const raw = token.trim()
    if (!raw) return true
    const alias = getUniversityAlias(raw)
    const norm = normalizeSearchQuery(raw)
    const univNorm = fullwidthToHalfwidth(raw).replace(/(大学校|大学|大)$/, '')
    const codeQuery = raw.replace(CODE_HYPHEN, '')

    // 0. University group match (MARCH, 早慶, 旧帝大, etc.)
    const groupUnivs = getUniversitiesInGroup(raw) || (norm ? getUniversitiesInGroup(norm) : undefined)
    if (groupUnivs) {
        if (groupUnivs.some((u) => r.university === u || r.university.startsWith(u + ' '))) {
            return true
        }
    }

    // 1. University alias match
    if (alias) {
        if (r.university === alias || r.university.startsWith(alias + ' ')) {
            return true
        }
        // If query token is also present literally in code, faculty, or department
        if (r.code.includes(raw) || r.faculty.includes(raw) || r.department.includes(raw)) {
            return true
        }
        return false
    }

    // 2. University match (exact or normalized university name)
    // Only strip university suffixes (大学校/大学/大). Do NOT match university if query stripped faculty suffix (学部/学科/専攻).
    if (r.university.includes(raw) || (univNorm && r.university.includes(univNorm))) {
        return true
    }

    // 3. Code match
    if (r.code.includes(raw) || (codeQuery && r.code.replace(CODE_HYPHEN, '').includes(codeQuery))) {
        return true
    }

    // 4. Faculty & Department match
    if (r.faculty.includes(raw) || (norm && r.faculty.includes(norm))) {
        return true
    }
    if (r.department.includes(raw) || (norm && r.department.includes(norm))) {
        return true
    }

    // 5. Method match
    if (r.method.includes(raw) || (norm && r.method.includes(norm))) {
        return true
    }

    // 6. Schedule shorthand match
    if ((raw === '前' || raw === '前期') && (r.schedule === '前' || r.method.includes('前期'))) {
        return true
    }
    if ((raw === '後' || raw === '後期') && (r.schedule === '後' || r.method.includes('後期'))) {
        return true
    }
    if ((raw === '中' || raw === '中期') && (r.schedule === '中' || r.method.includes('中期'))) {
        return true
    }
    if (
        (raw === '共' || raw === '共テ' || raw === '共通' || raw === '共通テスト') &&
        (r.schedule === '共' || r.method.includes('共'))
    ) {
        return true
    }

    return false
}

export function classifyMatch(
    raw: string,
    q: string,
    codeQuery: string,
    r: CodeRow
): MatchClass {
    const tokens = splitQueryTokens(raw)

    // Multi-token query: check if one of the tokens matches university exactly / via alias / via group
    if (tokens.length > 1) {
        for (const t of tokens) {
            const groupUnivs = getUniversitiesInGroup(t)
            if (groupUnivs && groupUnivs.some((u) => r.university === u || r.university.startsWith(u + ' '))) {
                return { rank: 0, type: 'exact' }
            }
            const alias = getUniversityAlias(t)
            if (alias && (r.university === alias || r.university.startsWith(alias + ' '))) {
                return { rank: 0, type: 'exact' }
            }
            const tNorm = normalizeSearchQuery(t)
            if (
                r.university === t ||
                r.university === tNorm ||
                r.university === tNorm + '大学' ||
                r.university === tNorm + '大学校'
            ) {
                return { rank: 0, type: 'exact' }
            }
        }
        return { rank: 3, type: 'partial' }
    }

    // Single token: check group first
    const groupUnivs = getUniversitiesInGroup(raw) || (q ? getUniversitiesInGroup(q) : undefined)
    if (groupUnivs && groupUnivs.some((u) => r.university === u || r.university.startsWith(u + ' '))) {
        return { rank: 0, type: 'exact' }
    }

    // Single token: check alias
    const alias = getUniversityAlias(raw)
    if (alias && (r.university === alias || r.university.startsWith(alias + ' '))) {
        return { rank: 0, type: 'exact' }
    }

    if (
        r.university === raw ||
        r.university === q ||
        r.university === q + '大学' ||
        r.university === q + '大学校'
    ) {
        return { rank: 0, type: 'exact' }
    }
    if (r.code === codeQuery || r.code.replace(CODE_HYPHEN, '') === codeQuery) {
        return { rank: 1, type: 'code' }
    }
    if (
        (r.code + '-').startsWith(q) ||
        r.code.replace(CODE_HYPHEN, '').startsWith(codeQuery)
    ) {
        return { rank: 2, type: 'prefix' }
    }
    if (r.university.includes(q)) {
        return { rank: 3, type: 'partial' }
    }
    return { rank: 4, type: 'partial' }
}

export function textMatches(q: string, codeQuery: string, r: CodeRow): boolean {
    const tokens = splitQueryTokens(q)
    if (tokens.length > 1) {
        return tokens.every((token) => singleTokenMatches(token, r))
    }
    return (
        r.university.includes(q) ||
        r.code.includes(q) ||
        r.faculty.includes(q) ||
        r.department.includes(q) ||
        r.code.replace(CODE_HYPHEN, '').includes(codeQuery) ||
        singleTokenMatches(q, r)
    )
}

export const FACULTY_PATTERNS: Record<string, RegExp> = {
    文系: /文|法|経済|経営|社会|外国語|国際|コミュニケーション|英語|心理|人間|教育|神学|学芸|教養/,
    理系: /理|工|情報|建築|農|獣医|生物|化学|物理|環境|理工|人間|教育/,
    医療系: /医|歯|薬|看護|保健|医療|リハ/,
    芸術系: /芸術|音楽|美術|デザイン|造形|映画/,
    体育系: /体育|スポーツ/,
}
