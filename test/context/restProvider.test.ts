import { RestProvider, mapIssue, CORPUS_JQL } from '../../src/context/restProvider';

const issue = (key: string, extra: any = {}) => ({ id: `id-${key}`, key, fields: {
  summary: `S ${key}`, description: null, status: { name: 'To Do' }, assignee: { accountId: 'acc-1' }, duedate: '2026-12-01',
  parent: { id: 'id-EPIC-1' }, subtasks: [{ id: 'id-SUB-1' }], issuelinks: [{ outwardIssue: { id: 'id-PAY-9' } }, { inwardIssue: { id: 'id-PAY-8' } }],
  project: { key: key.split('-')[0] }, updated: '2026-10-20T10:00:00.000+0000', ...extra } });

test('mapIssue handles a null description and collects links, parent and children', () => {
  const w = mapIssue(issue('CHK-1'), 'https://site.atlassian.net');
  expect(w).toMatchObject({ id: 'id-CHK-1', key: 'CHK-1', title: 'S CHK-1', text: '', spaceKey: 'CHK', ownerAccountId: 'acc-1', parentId: 'id-EPIC-1', dueDate: '2026-12-01', url: 'https://site.atlassian.net/browse/CHK-1' });
  expect(w.childIds).toEqual(['id-SUB-1']);
  expect(w.linkedIds.sort()).toEqual(['id-PAY-8', 'id-PAY-9']);
});
test('listCorpus pages with nextPageToken and sends the corpus JQL', async () => {
  const bodies: any[] = [];
  const fetchJira = async (_path: string, init?: any) => {
    const body = JSON.parse(init.body); bodies.push(body);
    return { ok: true, status: 200, json: async () => body.nextPageToken
      ? { issues: [issue('PAY-4')] }
      : { issues: [issue('CHK-1')], nextPageToken: 't2' } };
  };
  const items = await new RestProvider(fetchJira, 'https://s').listCorpus();
  expect(items.map(i => i.key)).toEqual(['CHK-1', 'PAY-4']);
  expect(bodies[0].jql).toBe(CORPUS_JQL);
  expect(bodies[1].nextPageToken).toBe('t2');
});
test('connectionEvidence uses REST proxies: link, same space, same owner', async () => {
  const p = new RestProvider(async () => ({ ok: true, status: 200, json: async () => ({}) }), 'https://s');
  const a = mapIssue(issue('CHK-1'), 'https://s');
  const b = mapIssue(issue('PAY-4', { assignee: { accountId: 'acc-2' } }), 'https://s');
  expect(await p.connectionEvidence(a, b)).toEqual({ directLink: false, sharedTeam: false, sharedGoal: false, sharedCollaborator: false });
});
test('a failed Jira call throws with the status', async () => {
  const p = new RestProvider(async () => ({ ok: false, status: 403, json: async () => ({}) }), 'https://s');
  await expect(p.getItem('CHK-1')).rejects.toThrow('403');
});
