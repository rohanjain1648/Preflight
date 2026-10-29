export type Source = 'jira' | 'confluence';

export interface WorkItem {
  id: string;
  key?: string;
  source: Source;
  title: string;
  text: string;
  url: string;
  spaceKey: string;
  ownerAccountId?: string;
  status?: string;
  dueDate?: string;
  parentId?: string;
  childIds: string[];
  linkedIds: string[];
  updatedAt: string;
}

export interface Fingerprint {
  itemId: string;
  intent: string;
  tags: string[];
  systems: string[];
  kind: 'build' | 'change' | 'investigate' | 'policy';
  contentHash: string;
}

export interface Fingerprinted {
  item: WorkItem;
  fp: Fingerprint;
}

export interface Candidate extends Fingerprinted {
  score: number;
}

export type OverlapType = 'duplicate' | 'complementary' | 'conflicting' | 'none';

export interface Judgement {
  candidateId: string;
  type: OverlapType;
  confidence: number;
  reason: string;
}

export interface ConnectionEvidence {
  directLink: boolean;
  sharedTeam: boolean;
  sharedGoal: boolean;
  sharedCollaborator: boolean;
}

export interface OverlapFinding {
  check: 'overlap';
  target: WorkItem;
  type: Exclude<OverlapType, 'none'>;
  confidence: number;
  reason: string;
  connection: number;
  evidence: ConnectionEvidence;
  unknown: boolean;
}

export interface DecisionFinding {
  check: 'precedent';
  decisionId: string;
  title: string;
  stance: 'complies' | 'conflicts' | 'related';
  status: 'proposed' | 'accepted' | 'superseded' | 'rejected';
  confidence: number;
  quote: string;
  sourceUrl: string;
}

export interface DownstreamFinding {
  check: 'downstream';
  target: WorkItem;
  severity: 'high' | 'medium' | 'low';
  path: string[];
  hops: number;
}

export type Clearance = 'clear' | 'caution' | 'hold';

export interface PreflightResult {
  subjectId: string;
  clearance: Clearance;
  overlaps: OverlapFinding[];
  decisions: DecisionFinding[];
  downstream: DownstreamFinding[];
  startedAt: string;
  finishedAt: string;
  modelCalls: number;
}
