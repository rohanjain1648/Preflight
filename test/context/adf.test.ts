import { adfToText } from '../../src/context/adf';

test('extracts text from paragraphs, mentions, emoji, code, tables and nested lists', () => {
  const doc = { type: 'doc', content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Ping ' }, { type: 'mention', attrs: { text: '@Priya' } }, { type: 'emoji', attrs: { shortName: ':rocket:' } }] },
    { type: 'codeBlock', content: [{ type: 'text', text: 'retry(3)' }] },
    { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'cell' }] }] }] }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'outer' }] }, { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'inner' }] }] }] }] }] },
    { type: 'mediaSingle', content: [{ type: 'media', attrs: { id: 'x' } }] },
  ] };
  const text = adfToText(doc);
  for (const w of ['Ping', '@Priya', 'retry(3)', 'cell', 'outer', 'inner']) expect(text).toContain(w);
});
test('null, strings and unknown shapes do not throw', () => {
  expect(adfToText(null)).toBe('');
  expect(adfToText('plain')).toBe('plain');
  expect(adfToText({ weird: true })).toBe('');
});
