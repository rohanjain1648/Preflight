import type { Candidate, ConnectionEvidence, Judgement, OverlapFinding } from '../domain/types';
import { MAX_OVERLAPS_SHOWN, OVERLAP_MIN_CONFIDENCE } from '../domain/config';
import { connectionScore, isUnknownOverlap } from './connection';

const NO_EVIDENCE: ConnectionEvidence = {
  directLink: false, sharedTeam: false, sharedGoal: false, sharedCollaborator: false,
};

export function rankOverlaps(
  judgements: Judgement[],
  candidates: Candidate[],
  evidence: Map<string, ConnectionEvidence>,
): OverlapFinding[] {
  const byId = new Map(candidates.map(c => [c.item.id, c]));
  const findings: OverlapFinding[] = [];
  for (const j of judgements) {
    const cand = byId.get(j.candidateId);
    if (!cand || j.type === 'none' || j.confidence < OVERLAP_MIN_CONFIDENCE) continue;
    const ev = evidence.get(j.candidateId) ?? NO_EVIDENCE;
    const connection = connectionScore(ev);
    findings.push({
      check: 'overlap',
      target: cand.item,
      type: j.type,
      confidence: j.confidence,
      reason: j.reason,
      connection,
      evidence: ev,
      unknown: isUnknownOverlap(connection),
    });
  }
  findings.sort((a, b) => Number(b.unknown) - Number(a.unknown) || b.confidence - a.confidence);
  return findings.slice(0, MAX_OVERLAPS_SHOWN);
}
