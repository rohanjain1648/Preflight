export const OVERLAP_MIN_CONFIDENCE = 0.6 as const;
export const HOLD_OVERLAP_CONFIDENCE = 0.75 as const;
export const UNKNOWN_CONNECTION_THRESHOLD = 0.3 as const;
export const MAX_OVERLAPS_SHOWN = 3 as const;
export const CANDIDATES_FULL = 15 as const;
export const CANDIDATES_AGENT = 8 as const;
export const CORPUS_WINDOW_DAYS = 180 as const;

export const EVIDENCE_WEIGHTS = {
  directLink: 0.9,
  sharedTeam: 0.8,
  sharedGoal: 0.5,
  sharedCollaborator: 0.4,
} as const;

export const MAX_NEW_FINGERPRINTS_PER_RUN = 20 as const;
export const FINGERPRINT_CONCURRENCY = 5 as const;

// Both 'claude-sonnet-5' until Task 11 confirms a smaller model via list().
export const MODELS = {
  fast: 'claude-sonnet-5',
  strong: 'claude-sonnet-5',
} as const;
