import { extractJson } from '../../src/engine/json';

test('plain JSON', () => expect(extractJson('{"a":1}')).toEqual({ a: 1 }));
test('fenced JSON with prose around it', () => expect(extractJson('Here you go:\n```json\n[{"a":1}]\n```\nThanks')).toEqual([{ a: 1 }]));
test('first balanced object when prose precedes it', () => expect(extractJson('Sure! {"x": {"y": 2}} trailing')).toEqual({ x: { y: 2 } }));
test('malformed input throws', () => expect(() => extractJson('{"a": ')).toThrow('no JSON found'));
