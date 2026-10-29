const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'codeBlock', 'blockquote', 'listItem', 'tableRow',
  'panel', 'rule', 'mediaSingle', 'mediaGroup', 'decisionItem', 'taskItem', 'expand',
]);

function walk(node: unknown, out: string[]): void {
  if (node == null) return;
  if (typeof node === 'string') { out.push(node); return; }
  if (typeof node !== 'object') return;
  const n = node as { type?: unknown; text?: unknown; attrs?: Record<string, unknown>; content?: unknown };
  if (typeof n.text === 'string') out.push(n.text);
  if (n.attrs && typeof n.attrs === 'object') {
    if (typeof n.attrs.text === 'string') out.push(n.attrs.text);
    if (typeof n.attrs.shortName === 'string') out.push(n.attrs.shortName);
  }
  if (Array.isArray(n.content)) {
    for (const child of n.content) walk(child, out);
  }
  if (n.type === 'hardBreak') out.push('\n');
  else if (n.type === 'tableCell' || n.type === 'tableHeader') out.push(' ');
  else if (typeof n.type === 'string' && BLOCK_TYPES.has(n.type)) out.push('\n');
}

/** Flattens an Atlassian Document Format node to plain text. Never throws. */
export function adfToText(node: unknown): string {
  const out: string[] = [];
  walk(node, out);
  return out.join('').trim();
}
