import { buildJudgePrompt, parseJudgements, JUDGE_SYSTEM_PREFIX } from '../../src/engine/judge';
import { f, candidate } from '../helpers';

const subject = f('CHK-1', 'Retry and idempotency for payment webhooks', ['webhook-retries']);
const candidates = [candidate('PAY-4', 'Idempotency keys service'), candidate('INV-3', 'CSV export')];

test('prompt lists every candidate id exactly once', () => {
  const p = buildJudgePrompt(subject, candidates);
  for (const c of candidates) expect(p.user.split(c.item.id).length - 1).toBe(1);
});
test('system prompt starts with the recognisable prefix', () => {
  expect(buildJudgePrompt(subject, candidates).system.startsWith(JUDGE_SYSTEM_PREFIX)).toBe(true);
  expect(JUDGE_SYSTEM_PREFIX).toBe('You judge overlap');
});
test('drops unknown ids, clamps confidence, coerces bad types to none', () => {
  const out = parseJudgements({ judgements: [
    { candidateId: 'PAY-4', type: 'duplicate', confidence: 1.4, reason: 'same' },
    { candidateId: 'NOPE-1', type: 'duplicate', confidence: 0.9, reason: 'invented' },
    { candidateId: 'INV-3', type: 'banana', confidence: -2, reason: '' },
  ] }, new Set(['PAY-4', 'INV-3']));
  expect(out).toEqual([
    { candidateId: 'PAY-4', type: 'duplicate', confidence: 1, reason: 'same' },
    { candidateId: 'INV-3', type: 'none', confidence: 0, reason: '' },
  ]);
});
test('non-object input yields no judgements', () => expect(parseJudgements('oops', new Set(['A']))).toEqual([]));
test('a bare array or lone judgement object is not accepted', () => {
  const ids = new Set(['A']);
  expect(parseJudgements([{ candidateId: 'A', type: 'duplicate', confidence: 0.9, reason: 'r' }], ids)).toEqual([]);
  expect(parseJudgements({ candidateId: 'A', type: 'duplicate', confidence: 0.9, reason: 'r' }, ids)).toEqual([]);
  expect(parseJudgements({ judgements: 'nope' }, ids)).toEqual([]);
});
test('keeps only the highest-confidence judgement per candidate', () => {
  const out = parseJudgements({ judgements: [
    { candidateId: 'A', type: 'complementary', confidence: 0.4, reason: 'low' },
    { candidateId: 'A', type: 'duplicate', confidence: 0.9, reason: 'high' },
    { candidateId: 'A', type: 'conflicting', confidence: 0.6, reason: 'mid' },
  ] }, new Set(['A']));
  expect(out).toEqual([{ candidateId: 'A', type: 'duplicate', confidence: 0.9, reason: 'high' }]);
});
test('non-finite confidence becomes 0', () => {
  const out = parseJudgements({ judgements: [
    { candidateId: 'A', type: 'duplicate', confidence: Infinity, reason: 'a' },
    { candidateId: 'B', type: 'duplicate', confidence: NaN, reason: 'b' },
    { candidateId: 'C', type: 'duplicate', confidence: '0.9', reason: 'c' },
  ] }, new Set(['A', 'B', 'C']));
  expect(out.map(j => j.confidence)).toEqual([0, 0, 0]);
});
