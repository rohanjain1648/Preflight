import type { ConnectionEvidence, WorkItem } from '../domain/types';

export interface ContextProvider {
  getItem(keyOrId: string): Promise<WorkItem>;
  listCorpus(): Promise<WorkItem[]>;
  connectionEvidence(a: WorkItem, b: WorkItem): Promise<ConnectionEvidence>;
}
