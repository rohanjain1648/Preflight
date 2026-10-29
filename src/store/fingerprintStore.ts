import type { Fingerprint } from '../domain/types';

export interface FingerprintStore {
  getMany(itemIds: string[]): Promise<Map<string, Fingerprint>>;
  putMany(fps: Fingerprint[]): Promise<void>;
}

export class InMemoryFingerprintStore implements FingerprintStore {
  private readonly data = new Map<string, Fingerprint>();

  async getMany(itemIds: string[]): Promise<Map<string, Fingerprint>> {
    const out = new Map<string, Fingerprint>();
    for (const id of itemIds) {
      const fp = this.data.get(id);
      if (fp) out.set(id, fp);
    }
    return out;
  }

  async putMany(fps: Fingerprint[]): Promise<void> {
    for (const fp of fps) this.data.set(fp.itemId, fp);
  }
}
