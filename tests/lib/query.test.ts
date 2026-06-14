import { describe, it, expect } from 'bun:test'

// This import will fail until we create the module (RED phase)
import { sanitizeQuery } from '../../src/lib/query'

describe('sanitizeQuery', () => {
    it('returns empty string for whitespace-only input', () => {
        expect(sanitizeQuery('   ')).toBe('')
        expect(sanitizeQuery('\t\n ')).toBe('')
    })

    it('returns trimmed string for input with leading/trailing spaces', () => {
        expect(sanitizeQuery('  東京')).toBe('東京')
        expect(sanitizeQuery('東京  ')).toBe('東京')
        expect(sanitizeQuery('  東京大学  ')).toBe('東京大学')
    })

    it('returns empty string for empty input', () => {
        expect(sanitizeQuery('')).toBe('')
    })

    it('preserves inner spaces', () => {
        expect(sanitizeQuery('東京 大学')).toBe('東京 大学')
    })

    it('returns the same string for already-clean input', () => {
        expect(sanitizeQuery('東京大学')).toBe('東京大学')
    })

    // --- Full-width space normalization ---

    it('trims full-width spaces (U+3000) from both ends', () => {
        expect(sanitizeQuery('　　東京')).toBe('東京')
        expect(sanitizeQuery('東京　　')).toBe('東京')
        expect(sanitizeQuery('　　東京大学　　')).toBe('東京大学')
    })

    it('returns empty string for full-width-space-only input', () => {
        expect(sanitizeQuery('　　　')).toBe('')
    })

    it('preserves inner full-width spaces after conversion', () => {
        expect(sanitizeQuery('東京　　大学')).toBe('東京  大学')
    })

    it('handles mixed full-width and half-width spaces', () => {
        expect(sanitizeQuery(' 　東京　 ')).toBe('東京')
    })
})
