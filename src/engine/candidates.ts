import type { Candidate, Fingerprinted } from '../domain/types';
import { Bm25Index } from './bm25';

export function fingerprintText(f: Fingerprinted): string {
  return [f.item.title, f.fp.intent, ...f.fp.tags, ...f.fp.systems].join(' ');
}

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function isExcluded(subject: Fingerprinted, c: Fingerprinted): boolean {
  const s = subject.item;
  const o = c.item;
  if (o.id === s.id) return true;
  if (s.parentId === o.id) return true;
  if (s.childIds.includes(o.id)) return true;
  if (o.parentId === s.id) return true;
  if (s.parentId && s.parentId === o.parentId) return true;
  if (s.linkedIds.includes(o.id) || o.linkedIds.includes(s.id)) return true;
  return false;
}

export function retrieveCandidates(subject: Fingerprinted, corpus: Fingerprinted[], k: number): Candidate[] {
  const pool = corpus.filter(c => !isExcluded(subject, c));
  const index = new Bm25Index(pool.map(c => ({ id: c.item.id, text: fingerprintText(c) })));
  const hits = index.search(fingerprintText(subject));
  const top = hits[0]?.score ?? 0;
  const bm25ById = new Map(hits.map(h => [h.id, h.score]));
  return pool
    .map(c => {
      const bm25 = top > 0 ? (bm25ById.get(c.item.id) ?? 0) / top : 0;
      return { ...c, score: 0.7 * bm25 + 0.3 * jaccard(subject.fp.tags, c.fp.tags) };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
