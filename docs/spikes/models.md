# Spike: active Forge LLM models

Question: which models does `list()` from `@forge/llm` report as active? Is a smaller Claude model available for `MODELS.fast`?

## How to run

1. Open any Jira issue on `nutrailytics-team-j6uorgpb.atlassian.net` with the Preflight panel (development install).
2. In the panel, scroll to the **Dev spikes** section (only shown when `environmentType === 'DEVELOPMENT'`).
3. Click **Spike: models**. The panel prints JSON: `{ ms, models: [{ model, status }] }`.
4. Paste the model IDs and statuses below. If a smaller Claude model is `active`, set `MODELS.fast` in `src/domain/config.ts` and re-run `npm test`.

Type definition: `list(): Promise<{ models: { model: string; status: 'active' | 'deprecated' }[] }>` (`@forge/llm` 1.0.9).

Result: pending human run
