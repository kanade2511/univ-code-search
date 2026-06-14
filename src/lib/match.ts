import type { CodeRow } from './data'

const CODE_HYPHEN = /-/g

export function univType(code: string): '国立' | '公立' | '私立' {
    const first = code.charAt(0)
    if (first === '1') return '国立'
    if (first === '2') return '公立'
    if (first === '3') return '私立'
    return '国立'
}

export type MatchClass = { rank: number; type: 'exact' | 'code' | 'prefix' | 'partial' }

export function classifyMatch(
    raw: string,
    q: string,
    codeQuery: string,
    r: CodeRow
): MatchClass {
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
    return (
        r.university.includes(q) ||
        r.code.includes(q) ||
        r.faculty.includes(q) ||
        r.department.includes(q) ||
        r.code.replace(CODE_HYPHEN, '').includes(codeQuery)
    )
}

export const FACULTY_PATTERNS: Record<string, RegExp> = {
    文系: /文|法|経済|経営|社会|外国語|国際|コミュニケーション|英語|心理|人間|教育|神学|学芸|教養/,
    理系: /理|工|情報|建築|農|獣医|生物|化学|物理|環境|理工|人間|教育/,
    医療系: /医|歯|薬|看護|保健|医療|リハ/,
    芸術系: /芸術|音楽|美術|デザイン|造形|映画/,
    体育系: /体育|スポーツ/,
}
