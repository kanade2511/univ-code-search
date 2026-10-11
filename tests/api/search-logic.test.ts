import { describe, it, expect } from 'bun:test'
import { classifyMatch, textMatches, univType, FACULTY_PATTERNS } from '../../src/lib/match'
import type { CodeRow } from '../../src/lib/data'

const SAMPLE_ROW: CodeRow = {
    id: 1,
    university: '東京大学',
    faculty: '法学部',
    department: '法律学科',
    schedule: '前',
    method: '一般',
    code: '1140-91-0010',
    rank: 0,
    aliases: '',
}

describe('classifyMatch', () => {
    it('exact — university name matches raw', () => {
        expect(classifyMatch('東京大学', '東京', '東京大学', SAMPLE_ROW)).toEqual({
            rank: 0,
            type: 'exact',
        })
    })

    it('exact — with 大学 suffix completion', () => {
        expect(classifyMatch('東京', '東京', '東京', SAMPLE_ROW)).toEqual({
            rank: 0,
            type: 'exact',
        })
    })

    it('exact — code without hyphens', () => {
        expect(
            classifyMatch('1140910010', '1140910010', '1140910010', SAMPLE_ROW)
        ).toEqual({ rank: 1, type: 'code' })
    })

    it('exact — code with hyphens', () => {
        const r = classifyMatch('1140-91-0010', '1140-91-0010', '1140910010', SAMPLE_ROW)
        expect(r).toEqual({ rank: 1, type: 'code' })
    })

    it('prefix — code', () => {
        expect(classifyMatch('1140', '1140', '1140', SAMPLE_ROW)).toEqual({
            rank: 2,
            type: 'prefix',
        })
    })

    it('prefix — code without hyphens', () => {
        expect(classifyMatch('114091', '114091', '114091', SAMPLE_ROW)).toEqual({
            rank: 2,
            type: 'prefix',
        })
    })

    it('exact — alias matches canonical university', () => {
        expect(classifyMatch('東大', '東大', '東大', SAMPLE_ROW)).toEqual({
            rank: 0,
            type: 'exact',
        })
        expect(classifyMatch('とうだい', 'とうだい', 'とうだい', SAMPLE_ROW)).toEqual({
            rank: 0,
            type: 'exact',
        })
    })

    it('exact — multi-token with university alias', () => {
        expect(classifyMatch('東大 法学部', '東大 法', '東大法学部', SAMPLE_ROW)).toEqual({
            rank: 0,
            type: 'exact',
        })
    })

    it('partial — university LIKE', () => {
        expect(classifyMatch('京大', '京大', '京大', SAMPLE_ROW)).toEqual({
            rank: 3,
            type: 'partial',
        })
    })

    it('partial — university (old-name suffix falls through)', () => {
        const row: CodeRow = {
            ...SAMPLE_ROW,
            university: 'YIC学院大学 (旧名: 広島女学院大学)',
        }
        // Searching "YIC学院大学" against stored "YIC学院大学 (旧名: ...)" 
        // won't match exact (≠ because of suffix). Falls through to partial.
        expect(classifyMatch('YIC学院大学', 'YIC学院', 'YIC学院大学', row)).toEqual({
            rank: 3,
            type: 'partial',
        })
    })

    it('partial — searching old name hits LIKE', () => {
        const row: CodeRow = {
            ...SAMPLE_ROW,
            university: 'YIC学院大学 (旧名: 広島女学院大学)',
        }
        expect(classifyMatch('広島女学院', '広島女学院', '広島女学院', row)).toEqual({
            rank: 3,
            type: 'partial',
        })
    })
})

describe('textMatches', () => {
    it('matches university name', () => {
        expect(textMatches('東京', '東京', SAMPLE_ROW)).toBe(true)
    })

    it('matches code', () => {
        expect(textMatches('1140-91', '114091', SAMPLE_ROW)).toBe(true)
    })

    it('matches faculty', () => {
        expect(textMatches('法学部', '法学部', SAMPLE_ROW)).toBe(true)
    })

    it('matches department', () => {
        expect(textMatches('法律', '法律', SAMPLE_ROW)).toBe(true)
    })

    it('matches code without hyphens', () => {
        expect(textMatches('1140910010', '1140910010', SAMPLE_ROW)).toBe(true)
    })

    it('matches multi-keyword AND queries', () => {
        expect(textMatches('東京 法', '東京法', SAMPLE_ROW)).toBe(true)
        expect(textMatches('東京　法律', '東京法律', SAMPLE_ROW)).toBe(true)
        expect(textMatches('東大 前期', '東大前期', SAMPLE_ROW)).toBe(true)
        expect(textMatches('東大 1140', '東大1140', SAMPLE_ROW)).toBe(true)
    })

    it('does not match multi-keyword query when one token mismatches', () => {
        expect(textMatches('東京 経済', '東京経済', SAMPLE_ROW)).toBe(false)
        expect(textMatches('京都 法', '京都法', SAMPLE_ROW)).toBe(false)
    })

    it('matches alias directly', () => {
        expect(textMatches('東大', '東大', SAMPLE_ROW)).toBe(true)
        expect(textMatches('とうだい', 'とうだい', SAMPLE_ROW)).toBe(true)
    })

    it('matches faculty with suffix against short faculty data', () => {
        const rowWithShortFaculty: CodeRow = {
            ...SAMPLE_ROW,
            faculty: '法',
        }
        expect(textMatches('法学部', '法学部', rowWithShortFaculty)).toBe(true)
    })

    it('does not match unrelated query', () => {
        expect(textMatches('京都', '京都', SAMPLE_ROW)).toBe(false)
    })
})

describe('univType', () => {
    it('国立 — code starting with 1', () => {
        expect(univType('1140-91-0010')).toBe('国立')
    })

    it('公立 — code starting with 2', () => {
        expect(univType('2140-91-0010')).toBe('公立')
    })

    it('私立 — code starting with 3', () => {
        expect(univType('3140-91-0010')).toBe('私立')
    })

    it('defaults to 国立 for 0/4-9', () => {
        expect(univType('0140-91-0010')).toBe('国立')
        expect(univType('4140-91-0010')).toBe('国立')
    })
})

describe('FACULTY_PATTERNS', () => {
    it('文系 matches 法学部', () => {
        expect(FACULTY_PATTERNS['文系'].test('法学部')).toBe(true)
    })

    it('文系 matches 経済学部', () => {
        expect(FACULTY_PATTERNS['文系'].test('経済学部')).toBe(true)
    })

    it('理系 matches 工学部', () => {
        expect(FACULTY_PATTERNS['理系'].test('工学部')).toBe(true)
    })

    it('医療系 does not match 法学部', () => {
        expect(FACULTY_PATTERNS['医療系'].test('法学部')).toBe(false)
    })

    it('医療系 matches 医学部', () => {
        expect(FACULTY_PATTERNS['医療系'].test('医学部')).toBe(true)
    })

    it('芸術系 matches 音楽学部', () => {
        expect(FACULTY_PATTERNS['芸術系'].test('音楽学部')).toBe(true)
    })

    it('体育系 matches スポーツ科学部', () => {
        expect(FACULTY_PATTERNS['体育系'].test('スポーツ科学部')).toBe(true)
    })
})
