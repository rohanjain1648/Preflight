import * as c from '../../src/domain/config';

test('spec thresholds are pinned', () => {
  expect(c.OVERLAP_MIN_CONFIDENCE).toBe(0.6);
  expect(c.HOLD_OVERLAP_CONFIDENCE).toBe(0.75);
  expect(c.UNKNOWN_CONNECTION_THRESHOLD).toBe(0.3);
  expect(c.MAX_OVERLAPS_SHOWN).toBe(3);
  expect(c.CANDIDATES_FULL).toBe(15);
  expect(c.CANDIDATES_AGENT).toBe(8);
  expect(c.CORPUS_WINDOW_DAYS).toBe(180);
  expect(c.EVIDENCE_WEIGHTS).toEqual({ directLink: 0.9, sharedTeam: 0.8, sharedGoal: 0.5, sharedCollaborator: 0.4 });
});
