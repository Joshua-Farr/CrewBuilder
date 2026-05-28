export function normalizeString(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
    Array.from({ length: a.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
    }
  }

  return matrix[b.length][a.length];
}

export function fuzzyMatchScore(a: string, b: string): number {
  const na = normalizeString(a);
  const nb = normalizeString(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const distance = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - distance / maxLen;
}

export function isFuzzyMatch(a: string, b: string, threshold = 0.85): boolean {
  return fuzzyMatchScore(a, b) >= threshold;
}
