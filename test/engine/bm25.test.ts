import { Bm25Index } from '../../src/engine/bm25';

const docs = [
  { id: 'A', text: 'webhook retries idempotency keys payments' },
  { id: 'B', text: 'csv export for invoices' },
  { id: 'C', text: 'idempotency service for payment webhooks' },
];

test('ranks documents sharing rare terms above unrelated ones', () => {
  const hits = new Bm25Index(docs).search('idempotency for payment webhook retries');
  expect(hits.map(h => h.id).slice(0, 2).sort()).toEqual(['A', 'C']);
  expect(hits.find(h => h.id === 'B')).toBeUndefined();
});
test('empty corpus and empty query return no hits', () => {
  expect(new Bm25Index([]).search('anything')).toEqual([]);
  expect(new Bm25Index(docs).search('   ')).toEqual([]);
});
