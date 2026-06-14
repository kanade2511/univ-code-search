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

    // --- Full-width to half-width normalization ---

    it('converts full-width digits to half-width', () => {
        expect(normalizeSearchQuery('１２３')).toBe('123')
    })

    it('converts full-width uppercase letters to half-width', () => {
        expect(normalizeSearchQuery('ＡＢＣ')).toBe('ABC')
    })

    it('converts full-width lowercase letters to half-width', () => {
        expect(normalizeSearchQuery('ａｂｃ')).toBe('abc')
    })

    it('converts full-width space (U+3000) to half-width space', () => {
        // Note: trailing 大学 is stripped after space conversion
        expect(normalizeSearchQuery('東京　大学')).toBe('東京 ')
    })

    it('converts full-width space and retains 大学 when not at end', () => {
        expect(normalizeSearchQuery('東京　大学X')).toBe('東京 大学X')
    })

    it('converts mixed full-width characters', () => {
        expect(normalizeSearchQuery('ＡＢＣ１２３')).toBe('ABC123')
    })

    it('converts full-width query and strips trailing 大学', () => {
        expect(normalizeSearchQuery('東京大学')).toBe('東京')
        expect(normalizeSearchQuery('１２３大学')).toBe('123')
    })

    it('converts full-width letters with trailing 大', () => {
        expect(normalizeSearchQuery('ＡＢＣ大')).toBe('ABC')
    })

    it('preserves already half-width characters', () => {
        expect(normalizeSearchQuery('ABC123')).toBe('ABC123')
    })

    it('handles empty string (full-width conversion)', () => {
        expect(normalizeSearchQuery('')).toBe('')
    })

    it('converts full-width space only', () => {
        expect(normalizeSearchQuery('　')).toBe(' ')
    })

    it('converts full-width space and strips suffix', () => {
        expect(normalizeSearchQuery('　大学')).toBe(' ')
    })
})
