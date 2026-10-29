# First-run notes

- `timeoutSeconds: 55` on the `resolver` function is rejected by `forge lint` (only consumer and scheduledTrigger functions support custom timeouts). It was removed; UI resolvers use the platform default. Plan 2 moves full runs onto the job queue.
- `jira:issueContext` requires a `label`; added `label: Preflight`.
- Trigger key and function key may not both be `lifecycle` (duplicate module key); the function key is now `lifecycle-fn` (handler still `index.lifecycle`).
