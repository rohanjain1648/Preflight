import type { Clearance, PreflightResult } from '../domain/types';
import { HOLD_OVERLAP_CONFIDENCE } from '../domain/config';

export function decideClearance(
  r: Pick<PreflightResult, 'overlaps' | 'decisions' | 'downstream'>,
): Clearance {
  const hold =
    r.overlaps.some(o => o.unknown && o.confidence >= HOLD_OVERLAP_CONFIDENCE) ||
    r.decisions.some(d => d.stance === 'conflicts' && d.status === 'accepted') ||
    r.downstream.some(d => d.severity === 'high');
  if (hold) return 'hold';

  const caution =
    r.overlaps.length > 0 ||
    r.decisions.some(d => d.stance !== 'complies') ||
    r.downstream.some(d => d.severity !== 'low');
  return caution ? 'caution' : 'clear';
}
