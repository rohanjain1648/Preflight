import { connectionScore, isUnknownOverlap } from '../../src/engine/connection';
const none = { directLink: false, sharedTeam: false, sharedGoal: false, sharedCollaborator: false };

test('no evidence scores 0 and is unknown', () => {
  expect(connectionScore(none)).toBe(0);
  expect(isUnknownOverlap(0)).toBe(true);
});
test('combines evidence as 1 - product of (1 - weight)', () => {
  expect(connectionScore({ ...none, sharedGoal: true })).toBeCloseTo(0.5);
  expect(connectionScore({ ...none, sharedGoal: true, sharedCollaborator: true })).toBeCloseTo(0.7);
  expect(connectionScore({ directLink: true, sharedTeam: true, sharedGoal: true, sharedCollaborator: true })).toBeCloseTo(1 - 0.1 * 0.2 * 0.5 * 0.6);
});
test('threshold is strict at 0.3', () => {
  expect(isUnknownOverlap(0.29)).toBe(true);
  expect(isUnknownOverlap(0.3)).toBe(false);
});
