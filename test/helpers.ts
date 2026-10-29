// test/helpers.ts (later tasks add to this file)
import type { WorkItem, Fingerprinted, Candidate } from '../src/domain/types';

export const item = (id: string, title: string, extra: Partial<WorkItem> = {}): WorkItem => ({
  id, key: id, source: 'jira', title, text: '', url: `u/${id}`, spaceKey: id.split('-')[0],
  childIds: [], linkedIds: [], updatedAt: '2026-10-01', ...extra,
});
export const f = (id: string, title: string, tags: string[], extra: Partial<WorkItem> = {}): Fingerprinted => ({
  item: item(id, title, extra),
  fp: { itemId: id, intent: title, tags, systems: [], kind: 'build', contentHash: id },
});
export const candidate = (id: string, title = 'Candidate title'): Candidate => ({ ...f(id, title, []), score: 1 });
