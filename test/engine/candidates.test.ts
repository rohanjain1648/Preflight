import { retrieveCandidates } from '../../src/engine/candidates';
import { f } from '../helpers';

const subject = f('CHK-1', 'Retry and idempotency for payment webhooks', ['webhook-retries', 'idempotency-keys'], { parentId: 'CHK-0', childIds: ['CHK-2'], linkedIds: ['PAY-9'] });

const corpus = [
  subject,
  f('CHK-0', 'Payments webhooks epic', ['webhook-retries']),                         // parent
  f('CHK-2', 'Idempotency key storage for webhooks', ['idempotency-keys']),          // child
  f('PAY-9', 'Webhook retry scheduler', ['webhook-retries']),                        // already linked
  f('CHK-5', 'Retry policy for card webhooks', ['webhook-retries'], { parentId: 'CHK-0' }), // sibling, same epic
  f('PAY-4', 'Idempotency keys service for payment webhooks', ['idempotency-keys']),
  f('INV-3', 'CSV export for invoices', ['csv-export']),
];

test('excludes self, parent, children, siblings in the same epic and linked items', () => {
  const ids = retrieveCandidates(subject, corpus, 15).map(c => c.item.id);
  expect(ids).not.toContain('CHK-1');
  expect(ids).not.toContain('CHK-0');
  expect(ids).not.toContain('CHK-2');
  expect(ids).not.toContain('CHK-5');
  expect(ids).not.toContain('PAY-9');
});
test('returns the real overlap first and drops zero-score items', () => {
  const ids = retrieveCandidates(subject, corpus, 15).map(c => c.item.id);
  expect(ids[0]).toBe('PAY-4');
  expect(ids).not.toContain('INV-3');
});
test('respects k', () => {
  expect(retrieveCandidates(subject, corpus, 1)).toHaveLength(1);
});
