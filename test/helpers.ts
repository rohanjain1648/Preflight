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

// ---- Task 9 helpers ----
import type { ConnectionEvidence } from '../src/domain/types';
import type { ContextProvider } from '../src/context/provider';
import type { LlmClient } from '../src/llm/client';
import { FINGERPRINT_SYSTEM_PREFIX } from '../src/engine/fingerprint';
import { JUDGE_SYSTEM_PREFIX } from '../src/engine/judge';

export function fakeProvider(items: WorkItem[]): ContextProvider {
  return {
    async getItem(keyOrId) {
      const found = items.find(i => i.key === keyOrId || i.id === keyOrId);
      if (!found) throw new Error(`not found: ${keyOrId}`);
      return found;
    },
    async listCorpus() {
      return items;
    },
    async connectionEvidence(a, b): Promise<ConnectionEvidence> {
      return {
        directLink: a.linkedIds.includes(b.id) || b.linkedIds.includes(a.id),
        sharedTeam: a.spaceKey !== '' && b.spaceKey !== '' && a.spaceKey === b.spaceKey,
        sharedGoal: false,
        sharedCollaborator:
          a.ownerAccountId !== undefined && b.ownerAccountId !== undefined && a.ownerAccountId === b.ownerAccountId,
      };
    },
  };
}

export interface ScriptedLlm extends LlmClient {
  fingerprintCalls(): number;
}

const toText = (v: unknown): string => (typeof v === 'string' ? v : JSON.stringify(v));
const kebabTokens = (title: string): string[] =>
  title.toLowerCase().split(/[^a-z0-9]+/).filter(t => t !== '').slice(0, 3);

export function scriptedLlm(script: {
  fingerprint?: (title: string) => string | object | undefined;
  judge?: () => object;
}): ScriptedLlm {
  let fpCalls = 0;
  return {
    async complete({ system, user }) {
      let text: string;
      if (system.startsWith(FINGERPRINT_SYSTEM_PREFIX)) {
        fpCalls++;
        const title = /^Title: (.*)$/m.exec(user)?.[1] ?? '';
        const override = script.fingerprint?.(title);
        text = override !== undefined
          ? toText(override)
          : JSON.stringify({ intent: title, tags: kebabTokens(title), systems: [], kind: 'build' });
      } else if (system.startsWith(JUDGE_SYSTEM_PREFIX)) {
        text = toText(script.judge ? script.judge() : { judgements: [] });
      } else {
        throw new Error('scriptedLlm: unrecognised system prompt');
      }
      return { text, inputTokens: 0, outputTokens: 0 };
    },
    fingerprintCalls: () => fpCalls,
  };
}
