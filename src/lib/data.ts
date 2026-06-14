import { readFileSync } from 'fs'
import { join } from 'path'

export type CodeRow = {
    id: number
    university: string
    faculty: string
    department: string
    schedule: string
    method: string
    code: string
    rank: number
    aliases: string
}

let _rows: CodeRow[] | null = null
let _universitySet: string[] | null = null

/** Load all rows from data/codes.json (cached in module scope). */
export function loadRows(): CodeRow[] {
    if (_rows) return _rows
    const path = join(process.cwd(), 'data', 'codes.json')
    const raw = readFileSync(path, 'utf-8')
    _rows = JSON.parse(raw) as CodeRow[]
    return _rows
}

/** Get deduplicated, rank-sorted list of university names for suggestions. */
export function getUniversities(): string[] {
    if (_universitySet) return _universitySet
    const rows = loadRows()
    const seen = new Set<string>()
    const result: string[] = []
    // Sort by rank first so prestigious universities appear first
    const sorted = [...rows].sort((a, b) => a.rank - b.rank)
    for (const r of sorted) {
        if (!seen.has(r.university)) {
            seen.add(r.university)
            result.push(r.university)
        }
    }
    _universitySet = result
    return result
}

/** Clear module-level caches (useful for testing). */
export function clearCache(): void {
    _rows = null
    _universitySet = null
}
