import type { ConnectionEvidence } from '../domain/types';
import { EVIDENCE_WEIGHTS, UNKNOWN_CONNECTION_THRESHOLD } from '../domain/config';

export function connectionScore(e: ConnectionEvidence): number {
  let miss = 1;
  for (const key of Object.keys(EVIDENCE_WEIGHTS) as (keyof typeof EVIDENCE_WEIGHTS)[]) {
    if (e[key]) miss *= 1 - EVIDENCE_WEIGHTS[key];
  }
  return 1 - miss;
}

export function isUnknownOverlap(score: number): boolean {
  return score < UNKNOWN_CONNECTION_THRESHOLD;
}
