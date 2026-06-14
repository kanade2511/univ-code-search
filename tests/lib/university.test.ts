import { describe, it, expect } from 'bun:test'
import { normalizeSearchQuery } from '../../src/lib/university'

describe('normalizeSearchQuery', () => {
    it('removes trailing "大学" from query', () => {
        expect(normalizeSearchQuery('東京大学')).toBe('東京')
    })

    it('removes trailing "大" from query', () => {
        expect(normalizeSearchQuery('東洋大')).toBe('東洋')
    })

    it('does not modify query without "大学" or trailing "大"', () => {
        expect(normalizeSearchQuery('東京')).toBe('東京')
    })

    it('handles empty string', () => {
        expect(normalizeSearchQuery('')).toBe('')
    })

    it('does not remove "大" in the middle of the string', () => {
        expect(normalizeSearchQuery('大阪大学')).toBe('大阪')
    })

    it('removes only trailing "大学", not mid-string occurrences', () => {
        expect(normalizeSearchQuery('大学院大学')).toBe('大学院')
    })

    it('handles input that is just "大学"', () => {
        expect(normalizeSearchQuery('大学')).toBe('')
    })

    it('handles input that is just "大"', () => {
        expect(normalizeSearchQuery('大')).toBe('')
    })
})
