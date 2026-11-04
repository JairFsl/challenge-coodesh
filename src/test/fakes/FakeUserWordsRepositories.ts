import type { FavoriteWord, HistoryEntry } from '@/domain/entities';
import type { FavoritesRepository, HistoryRepository } from '@/domain/repositories';

/** In-memory server copy of the user's favorites. */
export class FakeFavoritesRepository implements FavoritesRepository {
  rows = new Map<string, string>();

  list = jest.fn(
    async (): Promise<FavoriteWord[]> =>
      [...this.rows].map(([word, createdAt]) => ({ word, createdAt })),
  );
  add = jest.fn(async (word: string, createdAt: string) => {
    if (!this.rows.has(word)) {
      this.rows.set(word, createdAt);
    }
  });
  remove = jest.fn(async (word: string) => {
    this.rows.delete(word);
  });
}

/** In-memory server copy of the user's history. */
export class FakeHistoryRepository implements HistoryRepository {
  rows = new Map<string, string>();

  list = jest.fn(
    async (): Promise<HistoryEntry[]> =>
      [...this.rows].map(([word, viewedAt]) => ({ word, viewedAt })),
  );
  add = jest.fn(async (word: string, viewedAt: string) => {
    const current = this.rows.get(word);
    this.rows.set(word, current && current > viewedAt ? current : viewedAt);
  });
}
