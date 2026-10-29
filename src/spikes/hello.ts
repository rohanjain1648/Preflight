// Dev-only MCP spike (Task 11). Remove in Plan 2.
export async function spikeHello(payload: { name?: string }) {
  return { message: 'Preflight says hello, ' + (payload?.name ?? 'stranger') };
}
