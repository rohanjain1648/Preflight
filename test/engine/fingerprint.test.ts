import { buildFingerprintPrompt, parseFingerprint, fingerprintItem, FINGERPRINT_SYSTEM_PREFIX } from '../../src/engine/fingerprint';
import { item } from '../helpers';

test('prompt for a title-only item still carries the title and asks for JSON', () => {
  const p = buildFingerprintPrompt(item('CHK-1', 'Retry payment webhooks', { text: '' }));
  expect(p.user).toContain('Retry payment webhooks');
  expect(p.user).toContain('(no description)');
  expect(p.system).toMatch(/JSON/);
});
test('system prompt starts with the recognisable prefix', () => {
  expect(buildFingerprintPrompt(item('CHK-1', 'T')).system.startsWith(FINGERPRINT_SYSTEM_PREFIX)).toBe(true);
  expect(FINGERPRINT_SYSTEM_PREFIX).toBe('You fingerprint work items');
});
test('normalises tags to kebab-case, dedupes, caps at 8, defaults kind', () => {
  const fp = parseFingerprint({ intent: 'Builds retries', tags: ['Webhook Retries', 'webhook-retries', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], systems: ['Stripe'], kind: 'weird' }, 'X-1', 'h');
  expect(fp.tags[0]).toBe('webhook-retries');
  expect(new Set(fp.tags).size).toBe(fp.tags.length);
  expect(fp.tags.length).toBeLessThanOrEqual(8);
  expect(fp.kind).toBe('build');
});
test('missing intent throws', () => expect(() => parseFingerprint({ tags: [] }, 'X-1', 'h')).toThrow());
test('fingerprintItem tolerates prose around the model JSON', async () => {
  const llm = { complete: async () => ({ text: 'Result:\n```json\n{"intent":"x","tags":["y"],"systems":[],"kind":"change"}\n```', inputTokens: 1, outputTokens: 1 }) };
  const fp = await fingerprintItem(item('CHK-1', 'T'), llm);
  expect(fp).toMatchObject({ itemId: 'CHK-1', intent: 'x', tags: ['y'], kind: 'change' });
});
