/**
 * Normalize search query: strip trailing "大学" or "大" so that
 * "東京大学" matches the stored name "東京大学".
 */
export function normalizeSearchQuery(q: string): string {
  return q.replace(/(大学|大)$/, "");
}
