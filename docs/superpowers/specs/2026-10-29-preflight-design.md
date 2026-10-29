# Codegeist 2026: Winning Idea, PRD, TRD & Submission Plan

Oct 29, 2026 · @sowmya

## Executive summary

**Build Preflight: a Forge app that clears every piece of work for takeoff.** Before an epic, a design doc (RFC) or an AI agent's task starts, Preflight asks the Teamwork Graph three questions. Is someone already building this? Has it already been decided? Who will it affect? When work changes mid-flight, it tells each downstream owner what the change means for them.

- **Category:** Apps for Software Teams. **Bonus:** Best app with Atlassian MCP first, with Teamwork Graph and Best Agents also selected (one submission can win only one bonus).
- **Hero moment for the video:** a product manager creates an epic. Seconds later the panel reports that another team, with no shared people, goals or links, is already 40% through the same work. One click connects the two owners and records the decision.
- **Agent moment:** Claude Code or Rovo calls `preflight_check` over MCP before building a ticket, and gets back "Hold: conflicts with decision D-12, decided by the platform team on Sep 3".
- **Why it can win:** It turns Atlassian's own finding, that half of workers say their teams unknowingly worked on the same things, into a check that runs by itself. It uses the graph's structure, not just its search. Jira, Confluence, Teamwork Graph and Rovo all carry real weight, backed by Forge LLMs, Forge SQL and Forge Realtime.
- **Day-1 actions:** register the app, request Teamwork Graph allowlisting with its app ID, and check the name "Preflight" against existing Marketplace listings.

## Research: rules, judging and platform

You have 54 days. Submissions close **Tuesday, December 22, 2026 at 12:00 PT**. Judging runs January 5 to February 3, 2027, and winners are announced around February 15, 2027 ([official rules](https://codegeist2026.devpost.com/rules)).

### How judging works

Stage one is a pass/fail check that the app fits the theme and uses the required APIs. Stage two scores five criteria at 20% each ([hackathon page](https://codegeist2026.devpost.com/)). Ties go to the higher Technological Implementation score first, then down the list. Judges do not have to watch past minute 3 of the video.

| Criterion (20% each) | What judges ask | What it means for this entry |
| --- | --- | --- |
| Technological Implementation | Thorough, skilled use of Forge and at least one Atlassian capability; working and non-trivial | Use several capabilities deeply (Teamwork Graph, Rovo, MCP), not a thin wrapper around one LLM call |
| Design | A complete, coherent product, not a proof of concept | Polished screens, onboarding, empty and error states |
| Potential Impact | A credible, specific case for a real problem and audience, proven by the demo | One persona, one painful and frequent moment, one number |
| Innovation / Idea | Creative, novel, different from existing concepts | Must do something Rovo Search and Rovo Chat do not already do |
| Presentation | Video shows it working end to end; pitch says problem, audience, why | The whole story lands in the first 3 minutes |

### Prizes and how they stack

- Grand prizes are per category: one 1st ($15,000), one 2nd ($8,000) and one 3rd ($5,000) in each of Software Teams, Business Teams and Specialized Industries.
- One submission can win at most one grand prize and one bonus prize. The sponsor can move an entry to another category or bonus.
- Each bonus pays $1,500 to 6 projects.

| Bonus | Evidence needed | Platform status (Oct 2026) |
| --- | --- | --- |
| Best Agents | `rovo:agent`, `rovo:agentConnector`, or reusable `rovo:skill` and `action` modules | rovo:agent available (used by 2025 winners); rovo:skill Preview; rovo:agentConnector EAP |
| Best app with Atlassian MCP | Actions exposed as tools through the `rovo:mcp` module; optional open-source skill.md for third-party agents | Preview |
| Best Teamwork Graph integration | Pushes data into the graph, or reads from the Teamwork Graph API | API Preview with an allowlist; connectors Jira only |
| Best Marketplace app | Listing link, or the Marketplace review ticket link | A listed app can't use an install link, so judges need a second, unlicensed app ID |

### What to submit

- An installation link from a production deploy, set to **Sharing** in the developer console ([distribution guide](https://developer.atlassian.com/platform/forge/distribute-your-apps/)). The installer must be a site admin.
- Step-by-step setup instructions for every configuration and integration.
- A public YouTube video under 5 minutes, with no unlicensed music or third-party trademarks.
- A text description of the features, how the app meets the Forge requirement, the category, the bonus picks and any bonus write-up.

### Platform capabilities that matter

| Capability | Status | Constraint that shapes the design |
| --- | --- | --- |
| [Teamwork Graph API](https://developer.atlassian.com/platform/teamwork-graph/call-the-teamwork-graph-api/) | Preview | Allowlist by app ID through Atlassian support. Jira and Confluence apps only. Install needs an org admin. Cypher wrapped in GraphQL, with persisted queries |
| [Teamwork Graph limits](https://developer.atlassian.com/platform/teamwork-graph/limitations-and-considerations/) | Current | An app either calls the API or provides a connector, never both. Runs on Atlassian is recommended; egress controls are coming |
| [graph:connector](https://developer.atlassian.com/platform/forge/manifest-reference/modules/teamwork-graph-connector) | Current | Jira only. May not store email, calendar, meeting recordings or HR data. 1,500 objects a minute ([rate limits](https://developer.atlassian.com/platform/teamwork-graph/rate-limits/)) |
| [rovo:agent](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/) | Available | Prompt, conversation starters, actions; sees only the workspace it is installed in |
| [rovo:mcp](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/) | Preview | One module, at most 50 actions. Endpoint `https://mcp.atlassian.com/forge/<appId>`. Admin enables external exposure per install; OAuth 2.1; calls run with the user's permissions |
| Forge LLMs (`@forge/llm`) | GA per Atlassian | Atlassian-hosted Claude models; usage billed in credits; counts as Runs on Atlassian |
| [Forge Realtime](https://community.developer.atlassian.com/t/forge-realtime-is-now-generally-available-ga/101571) | GA since June 30, 2026 | 50 operations per installation per second; backend publishes, frontend subscribes |

The graph is wide: about 80 object types and 240 relationship types. They cover goals, focus areas, teams, Jira work items, Confluence pages, Loom meetings, pull requests, deployments, JSM incidents, and chat conversations and messages. Examples: `jira-work-item-contributes-to-atlassian-goal`, `external-message-mentions-jira-work-item`, `loom-meeting-has-confluence-meeting-notes-page`, `jsm-incident-links-jira-work-item`.

### What won last year

The 2025 category winners each solved one concrete, governed problem ([winners post](https://www.atlassian.com/blog/developer/meet-the-winners-of-codegeist-2025-atlassian-williams-racing-edition)). Secure Notes for Jira won Software Teams, Frank (HR across Jira, Confluence and Rovo) won Business Teams, and FleetOps (fleet incident reporting) won Specialized Industries. The pattern: one clear user, real pain, permission-aware data, Rovo in the loop.

### Implications for the idea

1. Request Teamwork Graph API allowlisting on day 1; it has the longest lead time.
2. Read from the graph rather than build a connector: one app cannot do both, and the theme is about using context.
3. Keep EAP modules out of the judged build, because the install link needs a production deploy.
4. Target one category and one bonus, and design the demo around both.

## Ideation: eight concepts, one pick

**Preflight scores 31 of 35, three points clear of the next concept.** It is the only one that is new, testable on a judge's near-empty site, and a natural fit for the MCP, Teamwork Graph and Agents bonuses.

The concepts came from the three promises in the challenge text: who's doing what, what's already been decided, and what needs to happen next. Each was checked against Rovo's own features and the Marketplace. Each scores 1 to 5 on the five judging criteria plus two hackathon risks: can a judge test it on a fresh site, and can a small team ship it by December 22.

| Concept | What it does | Closest existing thing | Tech | Design | Impact | Innov. | Pres. | Testable | Shippable | Total /35 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Preflight** | Before work starts or changes, checks: decided already? someone already building it? who is affected? Same check for AI agents | Parts exist separately (see rows below); no combined clearance check, and no app gates overlap on graph distance | 5 | 4 | 5 | 5 | 5 | 4 | 3 | **31** |
| Ripple | Pushes a change (a slip, a block, a descope) through dependencies to every downstream owner | [Tripwire](https://marketplace.atlassian.com/apps/709393635/tripwire-dependency-slip-alerts-for-jira) does one-hop Jira slip alerts; Plans shows dependency lines | 5 | 4 | 4 | 3 | 5 | 4 | 3 | 28 |
| Echo | Finds teams unknowingly building the same thing | [AI Duplicate Detector](https://marketplace.atlassian.com/apps/807708114/ai-duplicate-detector-issue-assistant-for-jira) flags duplicate issues, with no team or graph awareness | 4 | 3 | 4 | 5 | 4 | 3 | 4 | 27 |
| Precedent | Decision memory that warns when new work contradicts a past decision | [Anchorr](https://marketplace.atlassian.com/apps/3628381141/anchorr) checks new issues against past decisions; [Decision Log for Confluence](https://marketplace.atlassian.com/apps/2435494237/decision-log-for-confluence); Rovo turns meeting decisions into Jira updates | 4 | 4 | 4 | 2 | 4 | 4 | 4 | 26 |
| Agent Briefing | Builds a context pack when work is assigned to a person or agent | Rovo agents in Jira already pull graph context | 4 | 4 | 4 | 2 | 3 | 4 | 4 | 25 |
| Knowledge-risk map | Shows where knowledge sits with one person | Code-level bus-factor tools; people analytics is a trust risk | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 25 |
| SoD Sentinel | Flags segregation-of-duties breaks for SOX audits (finance) | Compliance evidence tools; needs pull request and deploy data | 4 | 4 | 5 | 4 | 3 | 1 | 3 | 24 |
| Blast Radius | Shows the impact of a code change before merge | Compass; the Teamwork Graph CLI for coding agents | 5 | 4 | 4 | 3 | 4 | 1 | 2 | 23 |

Testable is low for SoD Sentinel and Blast Radius because judges' sites will have no repositories or deployments connected to the graph.

### Why Preflight wins

- **It joins the three strongest concepts at one moment people already have:** starting or changing work. Echo, Ripple and Precedent are each a feature; together they are a product.
- **Its hero check uses the graph twice.** Content says two pieces of work are similar; structure says their owners share no team, goal, link or collaborator. Rovo Chat can't find this, because nobody knows to ask.
- **It answers Atlassian's own research.** In State of Teams 2025, half of workers said their teams unknowingly worked on the same things, and only 7% of executives knew exactly how their teams' work supported company goals ([UNLEASH summary of the report](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/)).
- **It gives AI agents a clearance step.** In 2026, Rovo, Claude and Cursor start real work from Jira tickets. One MCP tool lets any of them ask "am I clear to build this?" before writing a line.
- **A judge can test it in minutes.** A seed button builds a two-team demo in the judge's own site.

### Anti-goals

- Not a duplicate-issue detector inside one backlog.
- Not a dependency Gantt chart or a scheduling tool.
- Not a decision-log app; decisions are one input to the check.
- Not people analytics: no scores about individuals, ever.

## PRD: Preflight

Preflight gives every new or changing piece of work a clearance level of **Clear**, **Caution** or **Hold**. The level comes from three graph-backed checks, and it is offered to people in Jira and Confluence and to agents through Rovo and MCP.

### Problem

Teams commit to work without three facts the organization already holds somewhere:

1. **Someone else is already doing it.** Half of workers say their teams unknowingly worked on the same things (State of Teams 2025).
2. **It was already decided**, or already rejected, in a page or thread the team never saw.
3. **It will hit someone downstream.** Jira notifies assignees, reporters and watchers, so a team that depends on an item rarely hears that it slipped.

AI agents make all three worse. They start work in seconds and carry none of this memory.

### Users

| Persona | Context | Job to be done |
| --- | --- | --- |
| Product manager or tech lead (primary) | 100 to 5,000 people, 5+ teams on Jira and Confluence; creates epics and RFCs | "Before I commit my team, show me if we'd duplicate, contradict or break someone." |
| Engineering manager or TPM | Owns delivery across teams | "When something upstream changes, tell me what it means for my team before standup." |
| AI agent (Rovo, Claude Code, Cursor) | Acts on Jira tickets | "Give me the constraints before I act." |
| Site or org admin | Installs and scopes the app | "Let me choose what it reads and who it notifies." |

### Core moments

1. **Takeoff.** Work starts: an epic is created, an RFC is published, or an agent picks up a ticket. Preflight runs the three checks and shows a clearance level with findings.
2. **In-flight.** Work changes: a due date moves, an item is blocked or descoped. Preflight works out who is downstream and sends each owner a three-line brief.
3. **Ask.** Anyone asks the Rovo agent, or any MCP client, a Preflight question in plain words.

### The three checks

| Check | Question | Inputs | Output |
| --- | --- | --- | --- |
| Overlap (hero) | Is someone already building this? | Open epics and stories in scope (updated in the last 180 days); Confluence pages labelled `rfc`, `spec` or `proposal` | Up to 3 matches: type (duplicate, complementary or conflicting), confidence, owner, progress, and connection evidence (shared team, goal, link or collaborator). Matches with no connection are flagged **unknown overlap** |
| Precedent | Has this already been decided? | Decisions recorded in Preflight; Confluence pages labelled `decision` or `adr`; Confluence decision items | Matching decisions with a stance (complies, conflicts or related), who decided, when, and the source |
| Downstream | Who will this affect? | Up to 2 hops from the item: blocks links, parent and children, fix version, linked goals and the teams behind them, linked Confluence pages | Affected items, owners and goals, ranked by severity; a date that now lands after a dependent's due date is high |

**Clearance rules.** Hold: an unknown overlap at confidence 0.75 or more, a conflicting decision, or a high-severity downstream date conflict. Caution: any other finding above threshold. Clear: nothing above threshold.

### User stories

1. As a PM, when I create an epic, the issue panel shows a clearance level and findings within 20 seconds, with each check resolving live.
2. As a PM, for an overlap I see the other work, its owner and progress, and why Preflight thinks our teams aren't connected. I can **Connect owners** or **Dismiss** with a reason.
3. As a PM, for a decision match I see the decision, its deciders, the date and the source. I can **Acknowledge** it or **Propose to supersede** it.
4. As anyone, I can **Record decision** from a Jira issue or from highlighted Confluence text.
5. As an upstream owner, I can run **What if** (slip N days, block, descope) and see the impact before I change anything.
6. As a downstream owner, when an upstream item changes I get a comment on my affected item: what changed, why it reaches me, what to do. One click acknowledges it.
7. As a Rovo user, I can ask: "Preflight this idea", "Who else is working on SSO?", "What did we decide about webhooks?", "If PAY-12 slips two weeks, who is affected?"
8. As a developer, I add Preflight's MCP endpoint to Claude Code or Cursor. The open-source skill.md tells my agent to call `preflight_check` before it builds a ticket.
9. As an engineering director, the Airspace page lists open overlaps, holds and unacknowledged alerts, and what they led to.
10. As an admin, I pick the Jira and Confluence spaces in scope, choose notification mode, load demo data, and see a health check.

### Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR1 | Run Preflight on epic creation (issue types configurable), on demand from the panel, from Rovo and from MCP | P0 |
| FR2 | Overlap check as specified above, with connection evidence and the unknown-overlap flag | P0 |
| FR3 | Precedent check as specified above | P0 |
| FR4 | Downstream check up to 2 hops, with severity | P0 |
| FR5 | What-if for slip, block and descope, without saving changes | P0 |
| FR6 | In-flight alerts on due date, fix version, blocked status and priority changes; comment mode is opt-in | P0 |
| FR7 | Actions: Connect owners (adds a "relates to" link and a comment on both items), Record decision, Acknowledge, Dismiss with reason | P0 |
| FR8 | Rovo agent with conversation starters and five actions | P0 |
| FR9 | The same actions as MCP tools through `rovo:mcp`, plus a public repo with skill.md and client setup guides | P0 |
| FR10 | Live progress in the panel through Forge Realtime | P0 |
| FR11 | Admin page: scope, notification mode, demo data seeding, health check | P0 |
| FR12 | Visibility gate: never show or send an item to a user who can't view it | P0 |
| FR13 | Airspace page: open findings, outcomes, simple metrics | P1 |
| FR14 | Confluence byline and panel for RFC pages; highlight-to-record decision | P1 |
| FR15 | Atlassian projects and goals in the overlap corpus | P1 |
| FR16 | Airspace map that draws overlaps and downstream paths | P2 |
| FR17 | Nightly organization-wide overlap sweep | P2 |
| FR18 | JSM incidents in the downstream check | P2 |
| FR19 | Marketplace listing | P2 |

P0 is the submission build. P1 lands if week 6 is on schedule. P2 is post-submission unless time frees up.

### Non-functional requirements

- **Speed:** cached result in under 1 second; fresh run under 20 seconds at p50 and 45 at p95; what-if under 8 seconds.
- **Precision over recall:** at most 3 overlaps per run; at least 80% of shown overlaps judged useful on the evaluation set.
- **Trust:** every finding cites its source and its path; one click dismisses; no score about any person.
- **Data residency:** eligible for Runs on Atlassian (Forge SQL, Forge LLMs, no outbound calls). MCP access happens only when a user connects their own client.
- **Cost:** fingerprints cached by content hash; at most 2 model calls per fresh run beyond fingerprinting.
- **Accessibility:** Atlassian design system components, keyboard reachable, status never shown by colour alone.

### Success metrics

| Metric | Target | When |
| --- | --- | --- |
| Install link to first Preflight result, using the seed | Under 5 minutes | Judging |
| Video covers all three checks, one in-flight alert and one MCP call | Under 3 minutes | Judging |
| Overlap precision on 40 labelled pairs | 0.8 or more | Before submission |
| Decision stance accuracy on 20 cases | 0.8 or more | Before submission |
| Shown overlaps that lead to Connect or a recorded decision | 30% or more | After launch |
| Median time from upstream change to downstream acknowledgment | Under 4 hours | After launch |

### Out of scope

- Writing into the Teamwork Graph: an app can either read the graph or run a connector, and Preflight reads.
- Rescheduling or auto-planning work.
- Chat messages and meeting transcripts as inputs, unless they already sit in the graph and appear in curated queries.

## TRD: Preflight

Preflight is one Forge app on Jira and Confluence, built to qualify for Runs on Atlassian. UI Kit screens sit in front of Forge functions and async queues. The Teamwork Graph supplies structure, Forge LLMs supply meaning, Forge SQL holds memory, and Forge Realtime streams progress.

&#91;embedded content: Preflight architecture · 5 surfaces, 1 engine, 5 platform services\]

A Jira event or a click queues a full run; Rovo and MCP calls take a cached fast path. Realtime pushes each check's result back to the open panel.

### Components

| Component | Responsibility | Built with |
| --- | --- | --- |
| Surfaces | Jira issue context panel, Record decision action, Airspace page, admin page; Confluence byline and highlight menu (P1) | UI Kit (`@forge/react`); Custom UI only for the P2 map |
| Resolvers | Get cached result, start a run, what-if, act on a finding | `@forge/resolver` |
| Five shared actions | One contract used by the Rovo agent and by MCP tools | `action`, `rovo:agent`, `rovo:mcp` |
| Triggers | Issue created or changed; hourly corpus refresh | `trigger`, `scheduledTrigger` |
| Job queue | Runs a full check off the request path, up to 15 minutes | `@forge/events` Queue and `consumer` |
| Engine | Fingerprint, Overlap, Precedent, Downstream, Clearance and brief | TypeScript modules |
| Graph client | Curated, persisted and direct Teamwork Graph queries | `requestTeamworkGraph` |
| Product client | Fresh Jira and Confluence reads, links, comments, permission checks; fallback when the graph is unavailable | Jira REST v3, Confluence REST v2 |
| Stores | Fingerprints, decisions, runs, findings, alerts; settings and query keys | Forge SQL, Forge KVS |
| Model calls | Fingerprints, judging, briefs | `@forge/llm` |
| Live updates | Push each check's result to open panels | `@forge/realtime` and the bridge `realtime` API |

The graph and REST clients sit behind one `ContextProvider` interface. The Teamwork Graph API is in Preview, needs an allowlist, and may lag brand-new writes. REST covers just-created items and changelogs; the graph covers teams, goals and cross-product structure.

### Manifest sketch

This is a starting point, not final syntax. Check module names, the `llm` block and the graph scope names against the Forge reference before the first deploy.

```yaml
modules:
  jira:issueContext:
    - key: preflight-panel
      title: Preflight
      resource: panel
      render: native
      resolver: { function: resolver }
  jira:issueAction:
    - key: record-decision
      title: Record decision
      resource: decision
      render: native
      resolver: { function: resolver }
  jira:globalPage:
    - key: airspace
      title: Preflight Airspace
      resource: airspace
      render: native
      resolver: { function: resolver }
  jira:adminPage:
    - key: preflight-admin
      title: Preflight setup
      resource: admin
      render: native
      resolver: { function: resolver }
  trigger:
    - key: issue-events
      function: onIssueEvent
      events: [avi:jira:created:issue, avi:jira:updated:issue]
  scheduledTrigger:
    - key: corpus-refresh
      function: refreshCorpus
      interval: hour
  consumer:
    - key: preflight-consumer
      queue: preflight-jobs
      function: runJob
  rovo:agent:
    - key: preflight-agent
      name: Preflight
      description: Checks if work is already underway, already decided, or will affect other teams.
      prompt: resource:prompts;agent.txt
      conversationStarters:
        - Preflight this idea for me
        - Who else is working on this?
        - If this slips two weeks, who is affected?
      actions: [preflight-check, find-overlaps, check-decisions, downstream-impact, record-decision]
  rovo:mcp:
    - key: preflight-mcp
      name: Preflight
      tools: [preflight-check, find-overlaps, check-decisions, downstream-impact, record-decision]
  action:
    - key: preflight-check
      name: Preflight check
      function: actionPreflight
      actionVerb: GET
      description: Call before starting or changing work. Returns Clear, Caution or Hold with overlaps, decisions and downstream impact.
      inputs:
        text: { title: Work description, type: string, required: false, description: Plain-language description of the planned work }
        issueKey: { title: Jira issue key, type: string, required: false, description: Existing work item to check }
    # find-overlaps, check-decisions, downstream-impact (GET) and record-decision (CREATE) follow the same shape
  function:
    - key: resolver
      handler: index.resolver
    - key: runJob
      handler: jobs.run
      timeoutSeconds: 300
permissions:
  scopes:
    - read:jira-work
    - write:jira-work
    - read:jira-user
    - storage:app
    - read:graph:issue:jira
    - read:graph:project:jira
    - read:graph:user:atlassian
    - read:graph:page:confluence
    # plus team, goal and project scopes from the graph scope reference
```

### Data model (Forge SQL)

| Table | Key columns | Notes |
| --- | --- | --- |
| `work_fingerprint` | source, source\_id, space\_key, team\_ari, owner\_id, title, url, status, progress, intent, tags (JSON), content\_hash, updated\_at | One row per epic, story or RFC page in scope |
| `decision` | title, statement, rationale, status (proposed, accepted, superseded, rejected), decided\_on, deciders (JSON), source\_url, tags (JSON), supersedes\_id | Recorded in Preflight or read from labelled pages |
| `preflight_run` | subject, trigger (create, manual, agent, mcp, change, whatif), clearance, summary, started\_at, finished\_at, tokens | One row per run |
| `finding` | run\_id, check, target, type, confidence, severity, evidence (JSON), path (JSON), state, reason, acted\_by, acted\_at | State: open, connected, acknowledged, dismissed |
| `downstream_alert` | change (JSON), affected\_issue, owner\_id, brief, comment\_id, acknowledged\_at | One per notified owner |

Forge SQL allows 1 GiB per production installation and 5 seconds per SELECT. A 10,000-item corpus at about 1 KB a row is roughly 10 MB. Settings, thresholds and persisted query keys live in KVS.

### How each check works

**Fingerprint.** On create, change or the hourly refresh, hash the title, description (first 4,000 characters), parent epic, labels and components. If the hash is new, a small, fast model returns JSON: a one-sentence intent, 3 to 8 capability tags, named systems, and a kind (build, change, investigate, policy).

**Overlap.**

1. Retrieve candidates without embeddings, because Forge LLMs offer none. Score BM25 over intent, tags and systems across the in-scope corpus, add tag overlap, and drop items already linked or in the same epic. Keep the top 15.
2. Judge them in one call to a stronger model. For each candidate it returns a type, a confidence from 0 to 1 and one line of reasoning, and it may only cite candidate IDs it was given.
3. Gather connection evidence from the graph for the two owners and spaces: a direct link (weight 0.9), a shared team (0.8), a shared goal (0.5), a shared collaborator (0.4). Connection = 1 − Π(1 − weight) over the evidence found. Below 0.3, the match is an unknown overlap.
4. Show the top 3 with confidence of at least 0.6, unknown overlaps first.

**Precedent.** The same retrieval runs over the decision corpus. The same judge call returns complies, conflicts or related, plus the sentence of the decision that drives the stance. A conflict with an accepted decision sets Hold.

**Downstream.** A breadth-first walk up to 2 hops. Edges and weights: blocks (1.0), child to parent epic (0.8), shared fix version (0.6), linked goal and the teams contributing to it (0.5), linked Confluence page owners (0.4). Severity is high when a dependent's due date now falls before the new date, medium within 5 working days of slack, low otherwise. What-if runs the same walk against a hypothetical date or status without saving it.

**Clearance and brief.** Rules from the PRD set the level. A small model writes the three-line brief from the structured findings only, so it cannot add facts.

**Visibility gate.** Before showing or sending any finding, check that the viewer can see the target: Jira `POST /rest/api/3/permissions/check` with Browse Projects, and the Confluence content permission check. A target the viewer can't see appears as "1 restricted item overlaps; ask your admin". Briefs for a recipient are written only from items that recipient can see.

### Teamwork Graph queries

New apps cannot send raw Cypher. Preflight uses curated queries first and registers persisted queries for the rest ([migration guide](https://developer.atlassian.com/platform/teamwork-graph/migrate-from-raw-cypher/)).

| Need | Query | Kind |
| --- | --- | --- |
| An owner's teams | `atlassianUserInTeams` | Curated |
| Teams linked to a space | `atlassianTeamsBySpace` | Curated |
| Members of a team | `atlassianTeamMembers` | Curated |
| Goals linked to a work item | `jiraWorkItemGoals` | Curated |
| Recent work in a space (corpus refresh) | `jiraSpaceWorkItems` | Curated |
| Page contributors and owners | `confluencePageContributors`, `confluencePageOwners` | Curated |
| One item, goal or project by ARI | `jiraWorkItem`, `atlassianGoal`, `atlassianProject` | Direct |
| Teams contributing to a goal | `atlassian_team_contributes_to_atlassian_goal` | Persisted |
| Items an item blocks or links | `jira_work_item_blocks_jira_work_item`, `jira_work_item_links_jira_work_item` | Persisted |
| Epic to project to goal | `jira_epic_tracks_atlassian_project`, `atlassian_project_contributes_to_atlassian_goal` | Persisted |
| An owner's collaborators | Two hops over `atlassian_user_contributed_to_jira_work_item` | Persisted |

- Register persisted queries once from a setup script run by an app contributor; they take about a minute to propagate. Store the returned keys in config ([persisted queries](https://developer.atlassian.com/platform/teamwork-graph/persisted-cypher-queries/)).
- Curated queries return at most 25 rows a page, so page through them.
- A missing scope returns an empty result, not an error. The health check runs one canary query per object type and names any scope the admin withheld ([scopes](https://developer.atlassian.com/platform/teamwork-graph/scopes/)).
- Results are filtered by the calling user's permissions. Background runs must confirm the graph accepts app-level calls; if not, they fall back to REST plus the visibility gate.

### Agents and MCP

One set of five actions serves both the Rovo agent and MCP clients, so there is one contract to test.

| Action | Verb | Inputs | Returns |
| --- | --- | --- | --- |
| `preflight-check` | GET | text or issueKey | Clearance, up to 3 findings per check, brief, link to the full run |
| `find-overlaps` | GET | text or issueKey | Overlaps with type, confidence, owner, connection evidence |
| `check-decisions` | GET | text or issueKey | Decisions with stance, deciders, date, source |
| `downstream-impact` | GET | issueKey, change (slip, block, descope), slipDays | Affected items with severity and path |
| `record-decision` | CREATE | title, statement, rationale, issueKey | Decision ID and link |

- Rovo extracts inputs with a model, so they can be wrong. Authorization reads `context.accountId`, never an input.
- Each response returns compact JSON plus a markdown summary an agent can quote, kept under 8 KB.
- Agent calls are synchronous. They use cached fingerprints and judge only the top 8 candidates, to answer within 20 seconds. A longer run returns a partial result and a link.
- External MCP access is off by default. An admin turns it on under Connected apps; clients connect to `https://mcp.atlassian.com/forge/<appId>` through OAuth 2.1, and every call runs with that user's permissions ([rovo:mcp](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/)).
- A public `preflight-skill` repo ships skill.md: call `preflight_check` before planning, before building a ticket, and before changing a due date; on Hold, stop and report to the user.

### Realtime

- One channel per run, `preflight-run:{runId}`. The panel subscribes with a subscribe-only token signed by the resolver.
- The consumer publishes at most 5 events per run: started, one per finished check, and finished. That stays far below the limit of 50 operations per installation per second.

### Security and privacy

- No outbound fetch permissions: all compute and data stay on Forge, which keeps Runs on Atlassian eligibility.
- Least-privilege scopes; graph scopes only for object types the queries touch (Forge caps an app at 50 scopes).
- No score about any person. Connection evidence describes teams and work, shown as facts.
- Model output must match a JSON schema and cite only IDs from its input; anything else is discarded.
- Comment mode is opt-in. Each owner gets at most 3 alerts a day; the rest go to a digest.

### Performance and cost budgets

| Step | Budget |
| --- | --- |
| Panel opens on a cached result | Under 1 second |
| Fingerprint one item | 1 small-model call, about 1,500 tokens in and 200 out |
| Judge overlaps and decisions | 1 larger-model call, about 6,000 tokens in and 600 out |
| Brief | 1 small-model call |
| Fresh run, end to end | Under 20 seconds at p50 |
| Any single SQL SELECT | Under 5 seconds (hard limit): index space\_key, updated\_at, source\_id |

### Testing and evaluation

- **Unit:** clearance rules, connection score, breadth-first walk, BM25 ranking (Vitest).
- **Contract:** recorded graph responses as fixtures, plus one live canary query per deploy.
- **Model evaluation:** 40 labelled overlap pairs and 20 decision cases; `npm run eval` reports precision and recall before each milestone.
- **End to end:** `forge tunnel` on a dev site, scripted from seed to epic to panel, with timings recorded.
- **Judge path:** a fresh site, install by link as a new admin, README only, under 5 minutes.

### Environments and delivery

- Development (tunnel), staging (team testing), production (the judges' install link, distribution set to Sharing).
- Request graph allowlisting for the production app ID, and for a second, licensed app ID if the Marketplace bonus is pursued.
- GitHub Actions: lint, test and deploy to staging on every merge to main; production deploys are manual and tagged.

### Demo data

The admin page's **Load demo data** fills two Jira spaces the judge picks ("Checkout" and "Payments Platform") with about 30 linked items and due dates, and adds 2 RFCs and 3 decision pages in one Confluence space. The seed is built to produce exactly one unknown overlap, one known overlap, one conflicting decision and one three-item downstream chain. Judges' sites usually have one person, so connection evidence relies on teams, spaces, goals and links rather than people.

## Submission plan

Submit on **Sunday, December 20, 2026**, two days before the Tuesday 12:00 PT deadline. Freeze the code on December 13, and leave production and the demo site untouched through judging (January 5 to February 3, 2027) and until winners are announced.

&#91;embedded content: Build plan · typed from this plan · Oct 29 to Dec 22, 2026\]

Week 0 is about access: allowlisting and three spikes (a graph query, a model call, a hello-world MCP tool). P0 is feature-complete by November 29, leaving three weeks for polish, judge-path testing and the video.

### Materials checklist

- [ ] Register on Devpost and add every team member to the project.
- [ ] Production deploy with distribution set to **Sharing**; copy the installation link.
- [ ] Someone outside the team installs it on a brand-new site using only the README, in under 5 minutes.
- [ ] Judge setup instructions (draft below) in the Devpost testing field and the README.
- [ ] Demo video, about 3 minutes and under 5, public on YouTube, with captions and only royalty-free music.
- [ ] Text description of features and functionality (draft below).
- [ ] Explanation of how it meets the Forge requirement: modules used and why.
- [ ] Category: Apps for Software Teams.
- [ ] Bonus selections with write-ups: MCP (tool list, endpoint, skill.md repo, a clip of Claude Code calling it), Teamwork Graph (the query table from the TRD), Agents (agent and actions).
- [ ] Public GitHub repo for `preflight-skill` with skill.md and client setup guides.
- [ ] Five gallery screenshots: panel on Hold, Connect owners, what-if, Rovo chat, Claude Code calling MCP.
- [ ] Optional: Marketplace review ticket link (steps below).

### Judge setup instructions (draft)

1. Open the installation link and install Preflight on your site. You need organization admin rights, because the app reads the Teamwork Graph. Approve the requested permissions.
2. In Jira, go to **Apps > Preflight setup**. Pick two Jira spaces (or create "Checkout" and "Payments Platform") and one Confluence space, then select **Load demo data**. It takes about a minute.
3. Open epic CHK-1, "Retry and idempotency for payment webhooks". The Preflight panel shows each check finishing, then **Hold**.
4. Select **Connect owners**, then open PAY-4 to see the new link and comment.
5. Open PAY-7 and select **What if > Slip 10 days** to see the downstream impact.
6. In Rovo chat, choose the Preflight agent and ask: "Preflight this: add Okta SSO for EU customers."
7. Optional, MCP: in Atlassian Administration, open **Connected apps > Preflight** and enable external tools. Add `https://mcp.atlassian.com/forge/<appId>` to Claude Code or Cursor, then ask "Run a preflight check on CHK-1".

If something looks empty, the setup page's health check names any missing permission and shows whether graph access is live.

### Demo video script

Judges don't have to watch past 3:00, so everything that scores sits before it.

| Time | On screen | Voice-over |
| --- | --- | --- |
| 0:00–0:15 | Text on black: "Half of workers say their teams unknowingly worked on the same things." | "Right now, two teams in your company are building the same thing. Neither knows." |
| 0:15–0:30 | Title: Preflight, clearance for every piece of work. Three questions appear | "Before work takes off, Preflight asks the Teamwork Graph three questions." |
| 0:30–1:15 | PM creates an epic; the panel resolves live; Hold: Payments Platform is 40% through the same work, with no shared team, goal or link | "Similar work, unconnected teams. That's the overlap nobody knew to search for." |
| 1:15–1:40 | Connect owners; record the decision "Reuse the idempotency service" | "One click introduces the owners and records what we decided." |
| 1:40–2:00 | A second item conflicts with decision D-12 | "It also knows what's already been decided, and by whom." |
| 2:00–2:25 | Due date moves on PAY-7; the downstream owner gets a three-line brief; what-if | "When work changes, everyone downstream hears it in minutes, not weeks." |
| 2:25–2:50 | Claude Code calls `preflight_check` over MCP, gets Hold, stops and reports | "Agents get the same clearance check before they write a line." |
| 2:50–3:00 | Architecture: Teamwork Graph, Rovo, MCP, Forge LLMs, SQL, Realtime; Runs on Atlassian | "Preflight. Know before you build." |
| 3:00–4:00 | Optional deep dive: graph queries, connection evidence, evaluation results | Technical detail for judges who keep watching |

Record at 1080p with the browser zoomed to 125% and the cursor highlighted. Show only the real, working app, never mock-ups.

### Devpost text (draft)

```markdown
## Inspiration
Half of workers say their teams have unknowingly worked on the same things (Atlassian, State of Teams 2025). The knowledge to prevent it already sits in the Teamwork Graph. Nobody knows to ask for it, and AI agents never do.

## What it does
Preflight gives every new or changing piece of work a clearance level: Clear, Caution or Hold. It answers three questions from the Teamwork Graph:
- Is someone already building this? It finds similar work owned by teams that share no team, goal, link or collaborator with yours.
- Has this already been decided? It matches the work against recorded decisions and says whether it complies or conflicts.
- Who will this affect? It walks dependencies, goals and linked pages, and briefs each downstream owner when work changes.

People see it in a Jira panel, a Confluence byline and the Airspace page. Agents get it through the Preflight Rovo agent and through MCP tools that Claude Code, Cursor or any MCP client can call before they act.

## How we built it
Forge (UI Kit, resolvers, async queues, triggers), the Teamwork Graph API (curated and persisted queries), Rovo agent and action modules, the rovo:mcp module, Forge LLMs, Forge SQL, Forge KVS and Forge Realtime. No data leaves Atlassian.

## Challenges
<fill in during the build>

## Accomplishments
<overlap precision on the evaluation set, setup time on a fresh site>

## What's next
Marketplace listing, organization-wide nightly sweeps, and JSM incidents in the downstream check.
```

### Marketplace bonus (optional, week 7)

An app submitted for listing can't use an installation link, so the judged app and the listed app must be two app IDs.

1. Create a Marketplace partner account.
2. Copy the app under a second app ID and deploy it to production with distribution set to Sharing.
3. Request Teamwork Graph allowlisting for that app ID as well.
4. Prepare the listing: name, tagline, highlights, 3 to 5 screenshots, privacy policy, security and data questionnaire, documentation and support links.
5. Submit for approval, then put the review ticket link in the Devpost form.

Only one bonus can be won, and MCP is the main target. Do this only if the submission build is done by December 13.

## Risks and open questions

The biggest risk is Teamwork Graph access: request allowlisting on day 1, and build the REST fallback first so the app works with or without the graph.

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Graph allowlisting is slow or refused | Medium | Request on day 1. The `ContextProvider` REST fallback keeps every check working on Jira and Confluence data. Without the graph, drop the graph bonus and keep MCP and Agents |
| Judges' sites are empty and have one user | High | Load demo data builds the whole story in about a minute. Connection evidence uses teams, spaces, goals and links, not people |
| The graph lags brand-new writes, so seeded items appear late | Medium | REST covers fresh items; the health check shows when graph data has arrived |
| Background runs can't query the graph as the app | Medium | Test in the week-0 spike. If true, user-started runs use the graph and trigger runs use REST plus the visibility gate |
| Rovo isn't active on a judge's site | Medium | Setup instructions say how to activate it; the Jira panel and actions work without Rovo; the video shows both agent paths |
| Overlap false positives erode trust | Medium | Top 3 only, confidence of at least 0.6, dismiss with reason, precision of at least 0.8 on the evaluation set |
| Alerts become noise | Medium | Comment mode is opt-in, at most 3 alerts per owner a day, the rest in a digest |
| Preview APIs (graph, `rovo:mcp`) change before judging | Low | Freeze on December 13, watch both changelogs, leave production untouched |
| MCP calls time out on long runs | Medium | Fast path under 20 seconds; longer runs return a partial result and a link |
| Forge LLMs credits cost more than expected | Low | Fingerprints cached by hash, a small model where possible, a daily cap per installation |
| Scope creep across three checks, an agent and MCP | High | P0, P1 and P2 cut lines. If P0 isn't done by November 29, Precedent reads only labelled pages |
| "Preflight" is already taken on the Marketplace | Low | Check on day 1; fallback names are Clearance and Takeoff |

### Open questions

- [ ] Team size: solo, confirmed October 29. The timeline assumes two builders, so P1 is dropped unless P0 lands early.
- [ ] Category: Software Teams (recommended) or Business Teams (likely less crowded, with a cross-team launch framing).
- [ ] Does the graph accept app-level calls for curated and persisted queries? Answer in the week-0 spike.
- [ ] Current Forge LLMs pricing for development and judging use.
- [ ] Can the seed create Atlassian teams, or must the judge create two teams by hand?

### Sources

Pages opened for this plan, as of October 29, 2026:

- [Codegeist 2026 overview](https://codegeist2026.devpost.com/), [official rules](https://codegeist2026.devpost.com/rules) and [resources](https://codegeist2026.devpost.com/resources)
- [Distribute your Forge apps](https://developer.atlassian.com/platform/forge/distribute-your-apps/)
- Teamwork Graph: [calling the API](https://developer.atlassian.com/platform/teamwork-graph/call-the-teamwork-graph-api/), [limitations](https://developer.atlassian.com/platform/teamwork-graph/limitations-and-considerations/), [scopes](https://developer.atlassian.com/platform/teamwork-graph/scopes/), [curated queries](https://developer.atlassian.com/platform/teamwork-graph/curated-queries/), [persisted queries](https://developer.atlassian.com/platform/teamwork-graph/persisted-cypher-queries/), [migrating from raw Cypher](https://developer.atlassian.com/platform/teamwork-graph/migrate-from-raw-cypher/), [direct object querying](https://developer.atlassian.com/platform/teamwork-graph/direct-object-querying/), [connector rate limits](https://developer.atlassian.com/platform/teamwork-graph/rate-limits/)
- Forge modules and services: [rovo:mcp](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-mcp/), [rovo:agent](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-agent/), [action](https://developer.atlassian.com/platform/forge/manifest-reference/modules/rovo-action/), [graph:connector](https://developer.atlassian.com/platform/forge/manifest-reference/modules/teamwork-graph-connector), [async events](https://developer.atlassian.com/platform/forge/runtime-reference/async-events-api/), [Forge SQL](https://developer.atlassian.com/platform/forge/storage-reference/sql/), [Forge LLMs](https://developer.atlassian.com/platform/forge/runtime-reference/forge-llms-api/), [Forge Realtime GA](https://community.developer.atlassian.com/t/forge-realtime-is-now-generally-available-ga/101571)
- [Codegeist 2025 winners](https://www.atlassian.com/blog/developer/meet-the-winners-of-codegeist-2025-atlassian-williams-racing-edition)
- [UNLEASH on State of Teams 2025](https://www.unleash.ai/artificial-intelligence/atlassian-ai-could-help-workers-stop-wasting-2-4-billion-hours-searching-for-information-every-year/)
- Marketplace: [Anchorr](https://marketplace.atlassian.com/apps/3628381141/anchorr), [Tripwire](https://marketplace.atlassian.com/apps/709393635/tripwire-dependency-slip-alerts-for-jira), [AI Duplicate Detector](https://marketplace.atlassian.com/apps/807708114/ai-duplicate-detector-issue-assistant-for-jira)
