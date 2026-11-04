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

test('Jira-shaped data: model answers with the issue key and the finding maps back to the item', async () => {
  const llm = scriptedLlm({ judge: () => ({ judgements: [{ candidateId: 'PAY-4', type: 'duplicate', confidence: 0.8, reason: 'same service' }] }) });
  const provider = fakeProvider([
    item('CHK-1', 'Idempotency for payment webhooks', { id: '10001' }),
    item('PAY-4', 'Idempotency keys service for payment webhooks', { id: '10023' }),
  ]);
  const r = await runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r.overlaps).toHaveLength(1);
  expect(r.overlaps[0].target).toMatchObject({ id: '10023', key: 'PAY-4' });
  expect(r.clearance).toBe('hold');
});

test('Jira-shaped data: a numeric candidateId echoing the item id is accepted', async () => {
  const llm = scriptedLlm({ judge: () => ({ judgements: [{ candidateId: 10023, type: 'duplicate', confidence: 0.8, reason: 'same service' }] }) });
  const provider = fakeProvider([
    item('CHK-1', 'Idempotency for payment webhooks', { id: '10001' }),
    item('PAY-4', 'Idempotency keys service for payment webhooks', { id: '10023' }),
  ]);
  const r = await runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r.overlaps).toHaveLength(1);
});

test('non-JSON judge output yields clear with one model call', async () => {
  const base = scriptedLlm({});
  const llm = { ...base, complete: async (req: any) => req.system.startsWith('You judge overlap')
    ? { text: 'I think these look similar, but I cannot say.', inputTokens: 0, outputTokens: 0 }
    : base.complete(req) };
  const provider = fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('PAY-4', 'Idempotency keys for payment webhooks')]);
  const r = await runOverlapPreflight('CHK-1', { provider, llm, fingerprints: new InMemoryFingerprintStore(), now }, 'full');
  expect(r.overlaps).toEqual([]);
  expect(r.clearance).toBe('clear');
  expect(r.modelCalls).toBe(1);
});

test('a failing corpus fingerprint does not stop the others being persisted', async () => {
  const llm = scriptedLlm({ fingerprint: (title) => title.includes('Broken') ? 'not json' : undefined });
  const fingerprints = new InMemoryFingerprintStore();
  const provider = fakeProvider([item('CHK-1', 'Idempotency for payment webhooks'), item('BAD-1', 'Broken item about webhooks'), item('PAY-4', 'Idempotency keys for payment webhooks')]);
  await runOverlapPreflight('CHK-1', { provider, llm, fingerprints, now }, 'full');
  const stored = await fingerprints.getMany(['CHK-1', 'BAD-1', 'PAY-4']);
  expect([...stored.keys()].sort()).toEqual(['CHK-1', 'PAY-4']);
});

test('stops starting corpus fingerprints once the deadline passes, and still completes', async () => {
  const llm = scriptedLlm({});
  const fingerprints = new InMemoryFingerprintStore();
  const items = [item('CHK-1', 'Idempotency for payment webhooks'), ...Array.from({ length: 8 }, (_, n) => item(`PAY-${n}`, `Payment webhook thing ${n}`))];
  let t = new Date('2026-11-05T10:00:00Z').getTime();
  const jumpingNow = () => {
    // After the subject fingerprint call (1) plus the first corpus call, jump far past the deadline.
    if (llm.fingerprintCalls() >= 2) t = new Date('2026-11-05T11:00:00Z').getTime();
    return new Date(t);
  };
  const r = await runOverlapPreflight('CHK-1', { provider: fakeProvider(items), llm, fingerprints, now: jumpingNow }, 'full');
  // concurrency 5: at most the first wave may have started before the clock jumped; nothing after it.
  expect(llm.fingerprintCalls()).toBe(2); // subject + the one corpus call started before the clock jumped
  expect(r.subjectId).toBe('CHK-1');
});
