/**
 * Convert full-width characters to half-width:
 *   Full-width digits (０-９) → half-width (0-9)
 *   Full-width letters (Ａ-Ｚ, ａ-ｚ) → half-width (A-Z, a-z)
 *   Full-width space (U+3000) → half-width space (U+0020)
 */
export function fullwidthToHalfwidth(s: string): string {
    let result = '';
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        if (code >= 0xff01 && code <= 0xff5e) {
            // Full-width ASCII range → half-width (offset 0xFEE0)
            result += String.fromCharCode(code - 0xfee0);
        } else if (code === 0x3000) {
            // Full-width space → half-width space
            result += ' ';
        } else {
            result += s.charAt(i);
        }
    }
    return result;
}

/**
 * Normalize search query: strip trailing "大学", "大学校", "大",
 * as well as trailing "学部", "学科", "専攻", "研究科" so that
 * "東京大学" matches "東京大学" and "法学部" matches "法".
 * Also converts full-width characters to half-width.
 */
export function normalizeSearchQuery(q: string): string {
    const halfwidth = fullwidthToHalfwidth(q);
    let normalized = halfwidth.replace(/(大学校|大学|大)$/, '');
    if (normalized.length > 2) {
        normalized = normalized.replace(/(学部|学科|専攻)$/, '');
    }
    if (normalized.length > 3) {
        normalized = normalized.replace(/研究科$/, '');
    }
    return normalized;
}

/**
 * Split query into distinct non-empty search tokens, converting full-width spaces.
 */
export function splitQueryTokens(q: string): string[] {
    const half = fullwidthToHalfwidth(q).trim();
    if (!half) return [];
    return half.split(/\s+/).filter(Boolean);
}
