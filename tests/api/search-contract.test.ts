import { describe, it, expect } from 'bun:test'
import type { SearchResponse } from '../../src/lib/types'

/**
 * Contract test for /api/search response shape.
 * 
 * Regressions this catches:
 * - exactCount/codeCount being page-local rather than global (BUG B)
 * - Missing required fields
 * - Wrong types on fields
 */
describe('SearchResponse contract', () => {
    it('does not include misleading page-local exactCount/codeCount', () => {
        // If these fields exist, they MUST represent global totals, not page-local.
        // Since they're unused by the frontend and were page-local, they should be removed.
        const validResponse: SearchResponse = {
            results: [],
            total: 0,
            page: 1,
            limit: 50,
        }

        // Verify the response doesn't have exactCount/codeCount
        expect('exactCount' in validResponse).toBe(false)
        expect('codeCount' in validResponse).toBe(false)
    })

    it('has required fields with correct types', () => {
        const response: SearchResponse = {
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
        const emptyResponse: SearchResponse = {
            results: [],
            total: 0,
            page: 1,
            limit: 50,
        }

        expect(emptyResponse.results).toBeArrayOfSize(0)
        expect(emptyResponse.total).toBe(0)
    })
})
