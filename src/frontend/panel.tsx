import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box, Button, Inline, Link, Lozenge, SectionMessage, Spinner, Stack, Text,
} from '@forge/react';
import { invoke, view } from '@forge/bridge';
import type { Clearance, ConnectionEvidence, OverlapFinding, PreflightResult } from '../domain/types';

const CLEARANCE: Record<Clearance, { label: string; appearance: 'success' | 'moved' | 'removed' }> = {
  clear: { label: 'Clear', appearance: 'success' },
  caution: { label: 'Caution', appearance: 'moved' },
  hold: { label: 'Hold', appearance: 'removed' },
};

export function describeEvidence(e: ConnectionEvidence): string {
  const parts: string[] = [];
  if (e.directLink) parts.push('direct link');
  if (e.sharedTeam) parts.push('shared team');
  if (e.sharedGoal) parts.push('shared goal');
  if (e.sharedCollaborator) parts.push('shared collaborator');
  return parts.length === 0
    ? 'No shared team, goal, link or collaborator'
    : `Shared: ${parts.join(', ')}`;
}

const OverlapRow = ({ o }: { o: OverlapFinding }) => (
  <Stack space="space.050">
    <Inline space="space.100" alignBlock="center">
      <Link href={o.target.url} openNewTab>{o.target.title}</Link>
      <Lozenge appearance="default">{o.type}</Lozenge>
      <Text>{Math.round(o.confidence * 100)}%</Text>
      {o.unknown && <Lozenge appearance="inprogress">Unknown overlap</Lozenge>}
    </Inline>
    <Text>{o.reason}</Text>
    <Text>{describeEvidence(o.evidence)}</Text>
  </Stack>
);

// Dev-only spike controls (Task 11). Remove in Plan 2.
const DevSpikes = () => {
  const [out, setOut] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const call = async (fn: string) => {
    setBusy(true);
    try {
      setOut(JSON.stringify(await invoke(fn), null, 2));
    } catch (e) {
      setOut(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Stack space="space.100">
      <Text>Dev spikes</Text>
      <Inline space="space.100">
        <Button onClick={() => call('spikeModels')} isDisabled={busy}>Spike: models</Button>
        <Button onClick={() => call('spikeTwg')} isDisabled={busy}>Spike: Teamwork Graph</Button>
      </Inline>
      {out && <Text>{out}</Text>}
    </Stack>
  );
};

const Panel = () => {
  const [isDev, setIsDev] = useState(false);
  useEffect(() => {
    view.getContext().then((c) => setIsDev(c.environmentType === 'DEVELOPMENT')).catch(() => setIsDev(false));
  }, []);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      setResult((await invoke('runPreflight')) as PreflightResult);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Stack space="space.200">
      <Box>
        <Button appearance="primary" onClick={run} isDisabled={running}>Run Preflight</Button>
      </Box>
      {running && (
        <Inline space="space.100" alignBlock="center">
          <Spinner size="small" />
          <Text>Checking the graph…</Text>
        </Inline>
      )}
      {error && (
        <SectionMessage appearance="error" title="Preflight failed">
          <Text>{error}</Text>
        </SectionMessage>
      )}
      {result && !running && (
        <Stack space="space.150">
          <Inline space="space.100" alignBlock="center">
            <Text>Clearance</Text>
            <Lozenge appearance={CLEARANCE[result.clearance].appearance} isBold>
              {CLEARANCE[result.clearance].label}
            </Lozenge>
          </Inline>
          {result.overlaps.length === 0 && <Text>No overlapping work found.</Text>}
          {result.overlaps.map((o) => (
            <OverlapRow key={o.target.id} o={o} />
          ))}
        </Stack>
      )}
      {isDev && <DevSpikes />}
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <Panel />
  </React.StrictMode>
);
