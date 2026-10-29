import Resolver from '@forge/resolver';
import api, { assumeTrustedRoute } from '@forge/api';
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

export const handler = resolver.getDefinitions();
