import { describe, it, expect } from 'bun:test'
import { search, suggest } from '../../src/lib/search'

describe('search with real data (codes.json)', () => {
    it('searches by university alias (東大)', () => {
        const out = search({ q: '東大', page: 1, limit: 10 })
        expect(out.total).toBeGreaterThan(0)
        expect(out.results.slice(0, 6).every((r) => r.university === '東京大学')).toBe(true)
        expect(out.results[0].matchType).toBe('exact')
    })

    it('searches by multi-keyword (早稲田 法学部)', () => {
        const out = search({ q: '早稲田 法学部', page: 1, limit: 10 })
        expect(out.total).toBeGreaterThan(0)
        expect(out.results.every((r) => r.university === '早稲田大学' && r.faculty.includes('法'))).toBe(true)
    })

    it('searches by university and schedule (東大 前期)', () => {
        const out = search({ q: '東大 前期', page: 1, limit: 10 })
        expect(out.total).toBeGreaterThan(0)
        expect(out.results.every((r) => r.university === '東京大学' && (r.schedule === '前' || r.method.includes('前期')))).toBe(true)
    })

    it('searches by hiragana alias (わせだ)', () => {
        const out = search({ q: 'わせだ', page: 1, limit: 10 })
        expect(out.total).toBeGreaterThan(0)
        expect(out.results.some((r) => r.university === '早稲田大学')).toBe(true)
    })

    it('suggests canonical university from alias (とうだい -> 東京大学)', () => {
        const list = suggest('とうだい')
        expect(list[0]).toBe('東京大学')
    })
})
