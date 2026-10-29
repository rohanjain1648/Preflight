import { tokenize } from './text';

const K1 = 1.2;
const B = 0.75;

interface IndexedDoc {
  id: string;
  tf: Map<string, number>;
  length: number;
}

export class Bm25Index {
  private readonly docs: IndexedDoc[];
  private readonly df = new Map<string, number>();
  private readonly avgLength: number;

  constructor(docs: { id: string; text: string }[]) {
    this.docs = docs.map(d => {
      const tokens = tokenize(d.text);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return { id: d.id, tf, length: tokens.length };
    });
    const total = this.docs.reduce((sum, d) => sum + d.length, 0);
    this.avgLength = this.docs.length > 0 ? total / this.docs.length : 0;
  }

  search(query: string): { id: string; score: number }[] {
    const terms = [...new Set(tokenize(query))];
    const n = this.docs.length;
    if (n === 0 || terms.length === 0) return [];
    const hits: { id: string; score: number }[] = [];
    for (const doc of this.docs) {
      let score = 0;
      for (const term of terms) {
        const f = doc.tf.get(term);
        if (!f) continue;
        const df = this.df.get(term) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        const norm = this.avgLength > 0 ? doc.length / this.avgLength : 1;
        score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + B * norm)));
      }
      if (score > 0) hits.push({ id: doc.id, score });
    }
    return hits.sort((a, b) => b.score - a.score);
  }
}
