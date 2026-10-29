import { tokenize, hashContent } from '../../src/engine/text';

test('tokenize lowercases, splits on non-letters, drops stopwords and 1-char tokens', () => {
  expect(tokenize('Build the Retry-layer for Webhooks, v2!')).toEqual(['build', 'retry', 'layer', 'webhooks', 'v2']);
});
test('tokenize keeps non-Latin letters', () => {
  expect(tokenize('Zahlungsdienst für Händler')).toEqual(['zahlungsdienst', 'für', 'händler']);
});
test('hashContent is stable and order-sensitive', () => {
  expect(hashContent(['a', 'b'])).toBe(hashContent(['a', 'b']));
  expect(hashContent(['a', 'b'])).not.toBe(hashContent(['b', 'a']));
  expect(hashContent(['a'])).toMatch(/^[0-9a-f]{64}$/);
});
