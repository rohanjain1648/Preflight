import { migrationRunner } from '@forge/sql';

const CREATE_WORK_FINGERPRINT = `
CREATE TABLE IF NOT EXISTS work_fingerprint (
  item_id VARCHAR(64) PRIMARY KEY,
  intent TEXT NOT NULL,
  tags TEXT NOT NULL,
  systems TEXT NOT NULL,
  kind VARCHAR(16) NOT NULL,
  content_hash CHAR(64) NOT NULL,
  fingerprinted_at DATETIME NOT NULL
)`;

export async function runMigrations(): Promise<void> {
  await migrationRunner.enqueue('v001_create_work_fingerprint', CREATE_WORK_FINGERPRINT).run();
}
