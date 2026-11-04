import type {
  Candidate, ConnectionEvidence, Fingerprint, Fingerprinted, PreflightResult, WorkItem,
} from '../domain/types';
import {
  CANDIDATES_AGENT, CANDIDATES_FULL, FINGERPRINT_CONCURRENCY, FINGERPRINT_DEADLINE_MS, MAX_NEW_FINGERPRINTS_PER_RUN, MODELS,
} from '../domain/config';
import type { ContextProvider } from '../context/provider';
import type { LlmClient } from '../llm/client';
import type { FingerprintStore } from '../store/fingerprintStore';
import { retrieveCandidates } from './candidates';
import { decideClearance } from './clearance';
import { mapWithConcurrency } from './concurrency';
import { contentHashOf, fingerprintItem } from './fingerprint';
import { extractJson } from './json';
import { buildJudgePrompt, judgeId, parseJudgements } from './judge';
import { rankOverlaps } from './overlap';

export interface PreflightDeps {
  provider: ContextProvider;
  llm: LlmClient;
  fingerprints: FingerprintStore;
  now: () => Date;
}

const isFresh = (item: WorkItem, stored: Fingerprint | undefined): stored is Fingerprint =>
  stored !== undefined && stored.contentHash === contentHashOf(item);

export async function runOverlapPreflight(
  subjectKey: string,
  deps: PreflightDeps,
  mode: 'full' | 'agent',
): Promise<PreflightResult> {
  const startedAt = deps.now().toISOString();
  const deadline = deps.now().getTime() + FINGERPRINT_DEADLINE_MS;
  const { provider, llm, fingerprints, now } = deps;

  const subject = await provider.getItem(subjectKey);
  const corpus = (await provider.listCorpus()).filter(i => i.id !== subject.id);
  const stored = await fingerprints.getMany([subject.id, ...corpus.map(i => i.id)]);

  // The subject is always fingerprinted when missing or stale; failure is fatal.
  let subjectFp = stored.get(subject.id);
  if (!isFresh(subject, subjectFp)) {
    subjectFp = await fingerprintItem(subject, llm);
    await fingerprints.putMany([subjectFp]);
  }

  const withFp: Fingerprinted[] = [];
  const stale: WorkItem[] = [];
  for (const it of corpus) {
    const fp = stored.get(it.id);
    if (isFresh(it, fp)) withFp.push({ item: it, fp });
    else stale.push(it);
  }

  const batch = stale.slice(0, MAX_NEW_FINGERPRINTS_PER_RUN);
  // Each fingerprint is persisted as soon as it settles, so a timeout loses at most the in-flight ones.
  // Past the deadline no new calls start; skipped items are retried on a later run.
  const settled = await mapWithConcurrency(batch, FINGERPRINT_CONCURRENCY, async it => {
    if (now().getTime() > deadline) return undefined;
    const fp = await fingerprintItem(it, llm);
    await fingerprints.putMany([fp]);
    return fp;
  });
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled' && s.value !== undefined) withFp.push({ item: batch[i], fp: s.value });
  });

  const subjectFingerprinted: Fingerprinted = { item: subject, fp: subjectFp };
  const k = mode === 'agent' ? CANDIDATES_AGENT : CANDIDATES_FULL;
  const candidates: Candidate[] = retrieveCandidates(subjectFingerprinted, withFp, k);

  let overlaps: PreflightResult['overlaps'] = [];
  let modelCalls = 0;

  if (candidates.length > 0) {
    const { system, user } = buildJudgePrompt(subjectFingerprinted, candidates);
    const res = await llm.complete({ model: MODELS.strong, system, user, maxTokens: 1500 });
    modelCalls = 1;

    let judgements: ReturnType<typeof parseJudgements> = [];
    try {
      // The model answers with the IDs it was shown (Jira keys); item ids are also accepted.
      const allowed = new Set(candidates.flatMap(c => [judgeId(c), c.item.id]));
      judgements = parseJudgements(extractJson(res.text), allowed);
    } catch {
      judgements = [];
    }

    // Map the model's IDs back to item ids so everything downstream keys on item.id.
    const byAnswerId = new Map<string, Candidate>();
    for (const c of candidates) byAnswerId.set(c.item.id, c);
    for (const c of candidates) byAnswerId.set(judgeId(c), c);
    judgements = judgements.map(j => ({ ...j, candidateId: byAnswerId.get(j.candidateId)!.item.id }));

    const byId = new Map(candidates.map(c => [c.item.id, c]));
    const evidence = new Map<string, ConnectionEvidence>();
    for (const j of judgements) {
      const cand = byId.get(j.candidateId);
      if (cand && j.type !== 'none') evidence.set(j.candidateId, await provider.connectionEvidence(subject, cand.item));
    }
    overlaps = rankOverlaps(judgements, candidates, evidence);
  }

  const decisions: PreflightResult['decisions'] = [];
  const downstream: PreflightResult['downstream'] = [];
  return {
    subjectId: subjectKey,
    clearance: decideClearance({ overlaps, decisions, downstream }),
    overlaps,
    decisions,
    downstream,
    startedAt,
    finishedAt: now().toISOString(),
    modelCalls,
  };
}
