import { describe, it, expect } from 'bun:test'
import { getPassnaviUrl, hasDirectPassnaviId } from '../../src/lib/passnavi'

describe('getPassnaviUrl', () => {
    it('returns direct subject URL for known universities', () => {
        expect(getPassnaviUrl('東京大学')).toBe('https://passnavi.obunsha.co.jp/univ/0220/subject/')
        expect(getPassnaviUrl('京都大学')).toBe('https://passnavi.obunsha.co.jp/univ/0560/subject/')
        expect(getPassnaviUrl('早稲田大学')).toBe('https://passnavi.obunsha.co.jp/univ/3190/subject/')
        expect(getPassnaviUrl('慶應義塾大学')).toBe('https://passnavi.obunsha.co.jp/univ/2370/subject/')
        expect(getPassnaviUrl('芝浦工業大学')).toBe('https://passnavi.obunsha.co.jp/univ/2450/subject/')
    })

    it('handles university names with old name suffixes', () => {
        expect(getPassnaviUrl('東京大学 (旧名: 某大学)')).toBe('https://passnavi.obunsha.co.jp/univ/0220/subject/')
    })

    it('falls back to Passnavi search URL for unmapped universities', () => {
        const url = getPassnaviUrl('架空未来大学')
        expect(url).toContain('https://passnavi.obunsha.co.jp/search_univ/main-list/?keyword=')
        expect(url).toContain(encodeURIComponent('架空未来大学'))
    })

    it('hasDirectPassnaviId correctly detects presence', () => {
        expect(hasDirectPassnaviId('東京大学')).toBe(true)
        expect(hasDirectPassnaviId('早稲田大学')).toBe(true)
        expect(hasDirectPassnaviId('架空大学')).toBe(false)
    })
})
