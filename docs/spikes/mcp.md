# Spike: `rovo:mcp` tool reaches an external MCP client

Question: does the `spike-hello` action, exposed through a `rovo:mcp` module, work from an external MCP client (Claude Code)? What is the OAuth flow, the tool name clients see, and the round-trip latency?

## Deploy status

`forge lint` (0 errors), `forge deploy -e development` and `forge install --upgrade` all accepted the `action` module `spike-hello` (verb GET, input `name`, function `spike-hello-fn`) and the `rovo:mcp` module `preflight-mcp` (name `Preflight`, tools `[spike-hello]`). No Preview-gating or Rovo-not-enabled error occurred at deploy time. Note: the first lint run rejected the action until `description` was added to the action and to its input.

## How to run

1. Atlassian Administration (admin.atlassian.com) > Apps > Connected apps (or Rovo settings) > find **Preflight** > enable external tools / MCP access. Record any gating message.
2. MCP endpoint: `https://mcp.atlassian.com/forge/459344e3-43be-494c-9f97-59a1312e8320`
3. In a terminal: `claude mcp add --transport http preflight https://mcp.atlassian.com/forge/459344e3-43be-494c-9f97-59a1312e8320`
4. Start Claude Code, run `/mcp`, select `preflight` and complete the OAuth flow in the browser. Note each screen.
5. Ask Claude: "Call the preflight spike-hello tool with name Ada". Expected reply: `Preflight says hello, Ada`.
6. Record below: OAuth flow, the tool name as listed in `/mcp` (e.g. `mcp__preflight__...`), and round-trip latency (stopwatch is fine).

Result: pending human run
