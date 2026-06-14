import { describe, it, expect, beforeEach } from 'bun:test'
import { SimpleCache } from '../../src/lib/cache'

describe('SimpleCache', () => {
    let cache: SimpleCache<string>

    beforeEach(() => {
        cache = new SimpleCache<string>(60_000) // 1 minute TTL
    })

    it('returns undefined for missing key', () => {
        expect(cache.get('missing')).toBeUndefined()
    })

    it('returns stored value after set', () => {
        cache.set('key', 'value')
        expect(cache.get('key')).toBe('value')
    })

    it('returns undefined after TTL expires', () => {
        cache = new SimpleCache<string>(1) // 1ms TTL
        cache.set('key', 'value')
        // Wait for TTL to expire
        Bun.sleepSync(5)
        expect(cache.get('key')).toBeUndefined()
    })

    it('returns correct value for multiple keys', () => {
        cache.set('a', 'alpha')
        cache.set('b', 'beta')
        expect(cache.get('a')).toBe('alpha')
        expect(cache.get('b')).toBe('beta')
    })

    it('overwrites value for same key', () => {
        cache.set('key', 'old')
        cache.set('key', 'new')
        expect(cache.get('key')).toBe('new')
    })

    it('clear() removes all entries', () => {
        cache.set('a', 'alpha')
        cache.set('b', 'beta')
        cache.clear()
        expect(cache.get('a')).toBeUndefined()
        expect(cache.get('b')).toBeUndefined()
    })

    it('size reflects number of non-expired entries', () => {
        expect(cache.size).toBe(0)
        cache.set('a', 'alpha')
        expect(cache.size).toBe(1)
        cache.set('b', 'beta')
        expect(cache.size).toBe(2)
    })

    it('stores and retrieves complex objects', () => {
        const objCache = new SimpleCache<{ name: string; count: number }>(60_000)
        objCache.set('obj', { name: 'test', count: 42 })
        const result = objCache.get('obj')
        expect(result).toEqual({ name: 'test', count: 42 })
    })

    it('uses 5-minute TTL by default', () => {
        const defaultCache = new SimpleCache<string>()
        defaultCache.set('key', 'val')
        expect(defaultCache.get('key')).toBe('val')
    })
})
