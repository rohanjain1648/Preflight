import { sql } from '@forge/sql';
import type { Fingerprint } from '../domain/types';
import type { FingerprintStore } from './fingerprintStore';

interface Row {
  item_id: string;
  intent: string;
  tags: string;
  systems: string;
  kind: Fingerprint['kind'];
  content_hash: string;
}

const CHUNK = 100;

// Forge SQL returns values JSON-decoded, so a TEXT column holding a JSON array
// may arrive as a string or (defensively) already parsed.
function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

// 'YYYY-MM-DD HH:MM:SS' in UTC.
function nowUtc(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export class SqlFingerprintStore implements FingerprintStore {
  async getMany(itemIds: string[]): Promise<Map<string, Fingerprint>> {
    const out = new Map<string, Fingerprint>();
    for (let i = 0; i < itemIds.length; i += CHUNK) {
      const ids = itemIds.slice(i, i + CHUNK);
      const placeholders = ids.map(() => '?').join(', ');
      const { rows } = await sql
        .prepare<Row>(
          `SELECT item_id, intent, tags, systems, kind, content_hash FROM work_fingerprint WHERE item_id IN (${placeholders})`,
        )
        .bindParams(...ids)
        .execute();
      for (const r of rows) {
        out.set(r.item_id, {
          itemId: r.item_id,
          intent: r.intent,
          tags: parseList(r.tags),
          systems: parseList(r.systems),
          kind: r.kind,
          contentHash: r.content_hash,
        });
      }
    }
    return out;
  }

  async putMany(fps: Fingerprint[]): Promise<void> {
    const at = nowUtc();
    for (const fp of fps) {
      await sql
        .prepare(
          `INSERT INTO work_fingerprint (item_id, intent, tags, systems, kind, content_hash, fingerprinted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE intent = VALUES(intent), tags = VALUES(tags), systems = VALUES(systems),
             kind = VALUES(kind), content_hash = VALUES(content_hash), fingerprinted_at = VALUES(fingerprinted_at)`,
        )
        .bindParams(fp.itemId, fp.intent, JSON.stringify(fp.tags), JSON.stringify(fp.systems), fp.kind, fp.contentHash, at)
        .execute();
    }
  }
}
