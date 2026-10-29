import { decideClearance } from '../../src/engine/clearance';
import { ov, dec, down } from '../helpers';

test('nothing is clear', () => expect(decideClearance({ overlaps: [], decisions: [], downstream: [] })).toBe('clear'));
test('unknown overlap at 0.75 holds; at 0.74 cautions', () => {
  expect(decideClearance({ overlaps: [ov(true, 0.75)], decisions: [], downstream: [] })).toBe('hold');
  expect(decideClearance({ overlaps: [ov(true, 0.74)], decisions: [], downstream: [] })).toBe('caution');
});
test('known overlap never holds', () => expect(decideClearance({ overlaps: [ov(false, 0.99)], decisions: [], downstream: [] })).toBe('caution'));
test('conflict with an accepted decision holds; with a proposed one cautions', () => {
  expect(decideClearance({ overlaps: [], decisions: [dec('conflicts', 'accepted')], downstream: [] })).toBe('hold');
  expect(decideClearance({ overlaps: [], decisions: [dec('conflicts', 'proposed')], downstream: [] })).toBe('caution');
});
test('complies is informational', () => expect(decideClearance({ overlaps: [], decisions: [dec('complies', 'accepted')], downstream: [] })).toBe('clear'));
test('downstream: high holds, medium cautions, low is informational', () => {
  expect(decideClearance({ overlaps: [], decisions: [], downstream: [down('high')] })).toBe('hold');
  expect(decideClearance({ overlaps: [], decisions: [], downstream: [down('medium')] })).toBe('caution');
  expect(decideClearance({ overlaps: [], decisions: [], downstream: [down('low')] })).toBe('clear');
});
