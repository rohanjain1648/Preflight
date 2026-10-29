import { rankOverlaps } from '../../src/engine/overlap';
import { candidate } from '../helpers';

const candidates = ['C1', 'C2', 'C3', 'C4', 'C5'].map(id => candidate(id));

test('drops none, low confidence and unknown ids; unknown overlaps first; max 3', () => {
  const judgements = [
    { candidateId: 'C1', type: 'duplicate', confidence: 0.9, reason: 'same' },
    { candidateId: 'C2', type: 'complementary', confidence: 0.95, reason: 'adjacent' },
    { candidateId: 'C3', type: 'none', confidence: 0.99, reason: '' },
    { candidateId: 'C4', type: 'conflicting', confidence: 0.59, reason: 'weak' },
    { candidateId: 'C5', type: 'duplicate', confidence: 0.7, reason: 'similar' },
    { candidateId: 'ZZZ', type: 'duplicate', confidence: 1, reason: 'invented' },
  ];
  const evidence = new Map([['C2', { directLink: false, sharedTeam: true, sharedGoal: false, sharedCollaborator: false }]]);
  const out = rankOverlaps(judgements as any, candidates, evidence);
  expect(out.map(o => o.target.id)).toEqual(['C1', 'C5', 'C2']);
  expect(out[0].unknown).toBe(true);
  expect(out[2].unknown).toBe(false);
  expect(out[2].connection).toBeCloseTo(0.8);
});
