function tryParse(s: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
  }
}

/** Returns the balanced `{...}` or `[...]` span starting at `start`, or null if unbalanced. */
function balancedSpan(text: string, start: number): string | null {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else if (c === '}' || c === ']') {
      if (stack.pop() !== c) return null;
      if (stack.length === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Extracts the first JSON value from model output: plain, fenced, or embedded in prose. */
export function extractJson(text: string): unknown {
  const whole = tryParse(text.trim());
  if (whole.ok) return whole.value;

  const fence = /```(?:[a-zA-Z]+)?\s*\n?([\s\S]*?)```/.exec(text);
  if (fence) {
    const fenced = tryParse(fence[1].trim());
    if (fenced.ok) return fenced.value;
  }

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{' && text[i] !== '[') continue;
    const span = balancedSpan(text, i);
    if (span === null) continue;
    const parsed = tryParse(span);
    if (parsed.ok) return parsed.value;
  }
  throw new Error('no JSON found');
}
