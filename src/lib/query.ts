/**
 * Sanitize a search query: trim whitespace (including full-width space U+3000)
 * and return empty string for whitespace-only input so that the caller can
 * distinguish "no query" from "query with spaces".
 */
export function sanitizeQuery(value: string): string {
    return value.replace(/\u3000/g, ' ').trim()
}
