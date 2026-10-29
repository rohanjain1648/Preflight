import { runOverlapPreflight } from '../../src/engine/runPreflight';
import { fakeProvider, scriptedLlm, item } from '../helpers';
import { InMemoryFingerprintStore } from '../../src/store/fingerprintStore';

const now = () => new Date('2026-11-05T10:00:00Z');

test('empty corpus returns clear and never calls the judge', async () => {
  const llm = scriptedLlm({ judge: () => { throw new Error('judge must not be called'); } });
  const r = await runOverlapPreflight('CHK-1', { provider: fakeProvider([item('CHK-1', 'Retry webhooks')]), llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r).toMatchObject({ subjectId: 'CHK-1', clearance: 'clear', overlaps: [], modelCalls: 0 });
});

test('unknown overlap at 0.8 in another space produces Hold', async () => {
  const llm = scriptedLlm({ judge: () => ({ judgements: [{ candidateId: 'PAY-4', type: 'duplicate', confidence: 0.8, reason: 'same service' }] }) });
  const provider = fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('PAY-4', 'Idempotency keys service for payment webhooks'), item('INV-3', 'CSV export')]);
  const r = await runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r.clearance).toBe('hold');
  expect(r.overlaps).toHaveLength(1);
  expect(r.overlaps[0]).toMatchObject({ unknown: true, type: 'duplicate' });
  expect(r.modelCalls).toBe(1);
});

test('one corpus item whose fingerprint is garbage is skipped, not fatal', async () => {
  const llm = scriptedLlm({ fingerprint: (title) => title.includes('Broken') ? 'not json at all' : undefined, judge: () => ({ judgements: [] }) });
  const provider = fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('PAY-4', 'Idempotency keys for payment webhooks'), item('BAD-1', 'Broken item about webhooks')]);
  await expect(runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full')).resolves.toMatchObject({ clearance: 'clear' });
});

test('judge output with invented ids yields no findings', async () => {
  const llm = scriptedLlm({ judge: () => ({ judgements: [{ candidateId: 'FAKE-1', type: 'duplicate', confidence: 1, reason: 'x' }] }) });
  const provider = fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('PAY-4', 'Idempotency keys for payment webhooks')]);
  const r = await runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r.overlaps).toEqual([]);
});

test('fingerprints are cached by content hash across runs', async () => {
  const llm = scriptedLlm({ judge: () => ({ judgements: [] }) });
  const deps = { provider: fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('PAY-4', 'Idempotency keys for payment webhooks')]), llm, fingerprints: new InMemoryFingerprintStore(), now };
  await runOverlapPreflight('CHK-1', deps, 'full');
  const before = llm.fingerprintCalls();
  await runOverlapPreflight('CHK-1', deps, 'full');
  expect(llm.fingerprintCalls()).toBe(before);
});
