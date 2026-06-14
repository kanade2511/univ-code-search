import { describe, it, expect } from 'bun:test'
import type { SearchOutput } from '../../src/lib/search'

describe('SearchOutput contract', () => {
    it('does not include misleading page-local exactCount/codeCount', () => {
        const response: SearchOutput = {
            results: [],
            total: 0,
            page: 1,
            limit: 50,
        }

        expect('exactCount' in response).toBe(false)
        expect('codeCount' in response).toBe(false)
    })

    it('has required fields with correct types', () => {
        const response: SearchOutput = {
            results: [
                {
                    id: 1,
                    university: '東京大学',
                    faculty: '法学部',
                    department: '法律学科',
                    schedule: '前',
                    method: '一般',
                    code: '1140-91-0010',
                    matchType: 'exact',
                    univType: '国立',
                    rank: 0,
                },
            ],
            total: 1,
            page: 1,
            limit: 50,
        }

        expect(response.results).toBeArray()
        expect(response.results[0].university).toBe('東京大学')
        expect(response.total).toBe(1)
        expect(response.page).toBe(1)
        expect(response.limit).toBe(50)
    })

    it('handles empty search results', () => {
        const response: SearchOutput = {
            results: [],
            total: 0,
            page: 1,
            limit: 50,
        }

        expect(response.results).toBeArrayOfSize(0)
        expect(response.total).toBe(0)
    })
})
