import { InMemoryFingerprintStore } from '../../src/store/fingerprintStore';

test('putMany then getMany returns only stored ids; later puts overwrite', async () => {
  const s = new InMemoryFingerprintStore();
  const fp = (id: string, h: string) => ({ itemId: id, intent: 'i', tags: ['t'], systems: [], kind: 'build' as const, contentHash: h });
  await s.putMany([fp('A', '1'), fp('B', '1')]);
  await s.putMany([fp('A', '2')]);
  const got = await s.getMany(['A', 'C']);
  expect([...got.keys()]).toEqual(['A']);
  expect(got.get('A')!.contentHash).toBe('2');
  expect((await s.getMany([])).size).toBe(0);
});
