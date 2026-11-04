import { CORPUS_WINDOW_DAYS } from '../domain/config';
import type { ConnectionEvidence, WorkItem } from '../domain/types';
import { adfToText } from './adf';
import type { ContextProvider } from './provider';

export type JiraFetch = (
  path: string,
  init?: { method?: string; body?: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<any> }>;

export const CORPUS_JQL = `issuetype in (Epic, Story) AND statusCategory != Done AND updated >= -${CORPUS_WINDOW_DAYS}d ORDER BY updated DESC`;
export const ISSUE_FIELDS = ['summary', 'description', 'status', 'assignee', 'duedate', 'parent', 'subtasks', 'issuelinks', 'project', 'updated'];

const PAGE_SIZE = 100;
const MAX_CORPUS = 1000;
const MAX_PAGES = Math.ceil(MAX_CORPUS / PAGE_SIZE);

export function mapIssue(json: any, siteUrl: string): WorkItem {
  const f = json.fields ?? {};
  const linkedIds: string[] = [];
  for (const link of f.issuelinks ?? []) {
    const other = link?.outwardIssue ?? link?.inwardIssue;
    if (other?.id) linkedIds.push(String(other.id));
  }
  return {
    id: String(json.id),
    key: json.key ?? undefined,
    source: 'jira',
    title: f.summary ?? '',
    text: adfToText(f.description),
    url: `${siteUrl.replace(/\/+$/, '')}/browse/${json.key}`,
    spaceKey: f.project?.key ?? '',
    ownerAccountId: f.assignee?.accountId ?? undefined,
    status: f.status?.name ?? undefined,
    dueDate: f.duedate ?? undefined,
    parentId: f.parent?.id ? String(f.parent.id) : undefined,
    childIds: (f.subtasks ?? []).filter((s: any) => s?.id).map((s: any) => String(s.id)),
    linkedIds,
    updatedAt: f.updated ?? '',
  };
}

export class RestProvider implements ContextProvider {
  constructor(private readonly fetchJira: JiraFetch, private readonly siteUrl: string) {}

  private async call(path: string, init?: { method?: string; body?: string }): Promise<any> {
    const res = await this.fetchJira(path, init);
    if (!res.ok) throw new Error(`Jira request failed: ${res.status} ${path}`);
    return res.json();
  }

  async getItem(keyOrId: string): Promise<WorkItem> {
    const json = await this.call(`/rest/api/3/issue/${encodeURIComponent(keyOrId)}?fields=${ISSUE_FIELDS.join(',')}`);
    return mapIssue(json, this.siteUrl);
  }

  async listCorpus(): Promise<WorkItem[]> {
    const items: WorkItem[] = [];
    const seenTokens = new Set<string>();
    let nextPageToken: string | undefined;
    for (let pages = 0; pages < MAX_PAGES; pages++) {
      const body: Record<string, unknown> = { jql: CORPUS_JQL, fields: ISSUE_FIELDS, maxResults: PAGE_SIZE };
      if (nextPageToken) body.nextPageToken = nextPageToken;
      const page = await this.call('/rest/api/3/search/jql', { method: 'POST', body: JSON.stringify(body) });
      for (const issue of page.issues ?? []) items.push(mapIssue(issue, this.siteUrl));
      nextPageToken = page.nextPageToken || undefined;
      if (!nextPageToken || seenTokens.has(nextPageToken) || items.length >= MAX_CORPUS) break;
      seenTokens.add(nextPageToken);
    }
    return items.slice(0, MAX_CORPUS);
  }

  // REST proxies; Plan 2 replaces sharedTeam/sharedGoal with real graph data.
  async connectionEvidence(a: WorkItem, b: WorkItem): Promise<ConnectionEvidence> {
    return {
      directLink: a.linkedIds.includes(b.id) || b.linkedIds.includes(a.id),
      sharedTeam: a.spaceKey !== '' && a.spaceKey === b.spaceKey,
      sharedGoal: false,
      sharedCollaborator: !!a.ownerAccountId && a.ownerAccountId === b.ownerAccountId,
    };
  }
}
