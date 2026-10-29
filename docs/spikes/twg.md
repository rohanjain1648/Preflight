# Spike: Teamwork Graph API as user and as app

Questions: does `api.asUser().requestTeamworkGraph` return teams? Does `api.asApp()` work (spec open question)? Latency of each?

## Findings so far (from type definitions, `@forge/api` 8.4.x)

- `asUser()` returns `TeamworkGraphFetchMethods`: `requestTeamworkGraph(query, variables?, operationName?, extensions?, headers?) => Promise<Response>`.
- `asApp()` type (`AsAppFetchMethods`) has **no** `requestTeamworkGraph` method. The spike resolver checks for it at runtime and reports `api.asApp() has no requestTeamworkGraph method` if missing. Teamwork Graph appears to be user-context only.
- Scopes added to the manifest: `read:graph:user:atlassian`, `read:graph:team:atlassian`. `forge deploy` and `forge install --upgrade` accepted both scope names on the dev app (the exact team scope name is still unconfirmed against the graph scopes page, but the platform did not reject it).
- Teamwork Graph allowlist (Ecosystem Help Center ticket) is not yet granted, see `twg-allowlist.md`. Expect an authorization error until it is.

## How to run

1. Open a Jira issue with the Preflight panel on `nutrailytics-team-j6uorgpb.atlassian.net`.
2. In **Dev spikes**, click **Spike: Teamwork Graph**.
3. The panel prints `{ userId, asUser: {ok, ms, status, body|error}, asApp: {...} }`. The query is `atlassianUserInTeams(userId: $userId, first: 25) { nodes { id } }` with `userId = ari:cloud:identity::user/<your accountId>`. If the field shape is rejected, adjust the selection set in `src/resolvers/index.ts` (`TWG_QUERY`) to match the error.
4. Paste the exact output (errors included) and latencies below.

Result: pending human run
