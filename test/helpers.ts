// test/helpers.ts (later tasks add to this file)
import type {
  WorkItem, Fingerprinted, Candidate, OverlapFinding, DecisionFinding, DownstreamFinding,
} from '../src/domain/types';

export const item = (id: string, title: string, extra: Partial<WorkItem> = {}): WorkItem => ({
  id, key: id, source: 'jira', title, text: '', url: `u/${id}`, spaceKey: id.split('-')[0],
  childIds: [], linkedIds: [], updatedAt: '2026-10-01', ...extra,
});
export const f = (id: string, title: string, tags: string[], extra: Partial<WorkItem> = {}): Fingerprinted => ({
  item: item(id, title, extra),
  fp: { itemId: id, intent: title, tags, systems: [], kind: 'build', contentHash: id },
});
export const candidate = (id: string, title = 'Candidate title'): Candidate => ({ ...f(id, title, []), score: 1 });

export const ov = (unknown: boolean, confidence: number): OverlapFinding => ({
  check: 'overlap',
  target: item('T-1', 'Target'),
  type: 'duplicate',
  confidence,
  reason: 'placeholder reason',
  connection: unknown ? 0 : 0.9,
  evidence: { directLink: false, sharedTeam: false, sharedGoal: false, sharedCollaborator: false },
  unknown,
});
export const dec = (stance: DecisionFinding['stance'], status: DecisionFinding['status']): DecisionFinding => ({
  check: 'precedent',
  decisionId: 'D-1',
  title: 'Placeholder decision',
  stance,
  status,
  confidence: 0.9,
  quote: 'placeholder quote',
  sourceUrl: 'u/D-1',
});
export const down = (severity: DownstreamFinding['severity']): DownstreamFinding => ({
  check: 'downstream',
  target: item('T-2', 'Downstream'),
  severity,
  path: ['T-1', 'T-2'],
  hops: 1,
});
