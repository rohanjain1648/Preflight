import { runMigrations } from './store/migrations';

// Runs on app install and upgrade. A failed migration is logged, not thrown,
// so the trigger itself does not fail.
export async function lifecycle(_event?: unknown): Promise<void> {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Preflight: migration failed', err);
  }
}
