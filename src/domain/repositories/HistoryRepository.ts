import type { HistoryEntry } from '../entities';

export interface HistoryRepository {
  /** Most recent views first. */
  list(): Promise<HistoryEntry[]>;
  /** Idempotent upsert: keeps a single entry per word with the latest `viewedAt`. */
  add(word: string, viewedAt: string): Promise<void>;
}
