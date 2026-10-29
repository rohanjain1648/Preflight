import Resolver from '@forge/resolver';
import api, { assumeTrustedRoute } from '@forge/api';
import { list } from '@forge/llm';
import { RestProvider, type JiraFetch } from '../context/restProvider';
import { runOverlapPreflight } from '../engine/runPreflight';
import { ForgeLlmClient } from '../llm/forgeLlm';
import { SqlFingerprintStore } from '../store/sqlFingerprints';
import { runMigrations } from '../store/migrations';

const resolver = new Resolver();

resolver.define('runPreflight', async ({ context }) => {
  const key: string | undefined = context?.extension?.issue?.key;
  if (!key) throw new Error('Preflight: no issue key in the extension context');

  const started = Date.now();
  await runMigrations();

  const fetchJira: JiraFetch = (path, init) =>
    api.asApp().requestJira(assumeTrustedRoute(path), {
      method: init?.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: init?.body,
    });

  const result = await runOverlapPreflight(
    key,
    {
      provider: new RestProvider(fetchJira, context.siteUrl),
      llm: new ForgeLlmClient(),
      fingerprints: new SqlFingerprintStore(),
      now: () => new Date(),
    },
    'full',
  );

  console.log(`Preflight ${key}: ${Date.now() - started} ms, modelCalls=${result.modelCalls}, clearance=${result.clearance}`);
  return result;
});

// ---- Dev-only platform spikes (Task 11). Remove in Plan 2 once answers are recorded. ----

resolver.define('spikeModels', async () => {
  const started = Date.now();
  const res = await list();
  return { ms: Date.now() - started, ...res };
});

const TWG_QUERY = `query($userId: ID!) {
  atlassianUserInTeams(userId: $userId, first: 25) {
    nodes { id }
  }
}`;

interface TwgAttempt { ok: boolean; ms: number; status?: number; body?: unknown; error?: string }

async function timedTwg(
  call: (() => Promise<{ status: number; text(): Promise<string> }>) | undefined,
): Promise<TwgAttempt> {
  const started = Date.now();
  if (!call) return { ok: false, ms: 0, error: 'api.asApp() has no requestTeamworkGraph method' };
  try {
    const res = await call();
    const text = await res.text();
    let body: unknown = text;
    try { body = JSON.parse(text); } catch { /* keep raw text */ }
    return { ok: res.status >= 200 && res.status < 300, ms: Date.now() - started, status: res.status, body };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, error: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
  }
}

resolver.define('spikeTwg', async ({ context }) => {
  const accountId: string | undefined = context?.accountId;
  if (!accountId) throw new Error('spikeTwg: no accountId in context');
  const userId = `ari:cloud:identity::user/${accountId}`;
  const variables = { userId };

  const asUser = await timedTwg(() => api.asUser().requestTeamworkGraph(TWG_QUERY, variables));
  const app = api.asApp() as unknown as {
    requestTeamworkGraph?: (q: string, v?: unknown) => Promise<{ status: number; text(): Promise<string> }>;
  };
  const asApp = await timedTwg(
    typeof app.requestTeamworkGraph === 'function' ? () => app.requestTeamworkGraph!(TWG_QUERY, variables) : undefined,
  );
  return { userId, asUser, asApp };
});

export const handler = resolver.getDefinitions();
