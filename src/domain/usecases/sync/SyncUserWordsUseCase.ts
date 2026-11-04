import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';

import type { PendingOperation } from '../../entities';
import type { FavoritesRepository, HistoryRepository } from '../../repositories';
import type { RemoteUserWords } from '../../sync/userWords';

export interface SyncResult {
  syncedIds: string[];
  remote: RemoteUserWords | null;
  error: unknown;
}

@injectable()
export class SyncUserWordsUseCase {
  constructor(
    @inject(TOKENS.FavoritesRepository) private readonly favorites: FavoritesRepository,
    @inject(TOKENS.HistoryRepository) private readonly history: HistoryRepository,
  ) {}

  /**
   * Pushes the pending operations in order and then pulls the server copy.
   * Stops at the first failure so nothing is lost: the remaining operations
   * stay queued and are retried on the next sync.
   */
  async execute(pending: PendingOperation[]): Promise<SyncResult> {
    const syncedIds: string[] = [];
    try {
      for (const operation of pending) {
        await this.push(operation);
        syncedIds.push(operation.id);
      }
      const [favorites, history] = await Promise.all([this.favorites.list(), this.history.list()]);
      return { syncedIds, remote: { favorites, history }, error: null };
    } catch (error) {
      return { syncedIds, remote: null, error };
    }
  }

  private push({ type, word, createdAt }: PendingOperation): Promise<void> {
    switch (type) {
      case 'favorite.add':
        return this.favorites.add(word, createdAt);
      case 'favorite.remove':
        return this.favorites.remove(word);
      case 'history.add':
        return this.history.add(word, createdAt);
    }
  }
}
