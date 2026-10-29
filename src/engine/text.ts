import { createHash } from 'crypto';

const STOPWORDS = new Set([
  'the', 'for', 'and', 'of', 'to', 'a', 'in', 'on', 'with', 'is', 'are', 'be', 'by', 'as', 'at',
  'an', 'or', 'it', 'this', 'that', 'from', 'we', 'our', 'will', 'can', 'should', 'not', 'but',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

export function hashContent(parts: string[]): string {
  return createHash('sha256').update(parts.join('\u241E')).digest('hex');
}
