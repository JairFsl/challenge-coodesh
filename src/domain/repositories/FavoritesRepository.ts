import type { FavoriteWord } from '../entities';

export interface FavoritesRepository {
  list(): Promise<FavoriteWord[]>;
  /** Idempotent: adding an existing favorite is a no-op. */
  add(word: string, createdAt: string): Promise<void>;
  /** Idempotent: removing a missing favorite is a no-op. */
  remove(word: string): Promise<void>;
}
