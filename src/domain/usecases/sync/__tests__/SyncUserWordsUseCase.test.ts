import { NetworkError } from '@/core/errors';
import type { PendingOperation } from '@/domain/entities';
import {
  FakeFavoritesRepository,
  FakeHistoryRepository,
} from '@/test/fakes/FakeUserWordsRepositories';

import { SyncUserWordsUseCase } from '../SyncUserWordsUseCase';

const pending: PendingOperation[] = [
  { id: '1', userId: 'u', type: 'favorite.add', word: 'hello', createdAt: 't1' },
  { id: '2', userId: 'u', type: 'history.add', word: 'hello', createdAt: 't2' },
  { id: '3', userId: 'u', type: 'favorite.remove', word: 'cat', createdAt: 't3' },
];

describe('SyncUserWordsUseCase', () => {
  let favorites: FakeFavoritesRepository;
  let history: FakeHistoryRepository;
  let useCase: SyncUserWordsUseCase;

  beforeEach(() => {
    favorites = new FakeFavoritesRepository();
    history = new FakeHistoryRepository();
    favorites.rows.set('cat', 't0');
    useCase = new SyncUserWordsUseCase(favorites, history);
  });

  it('pushes every pending operation and returns the server copy', async () => {
    const result = await useCase.execute(pending);

    expect(favorites.add).toHaveBeenCalledWith('hello', 't1');
    expect(history.add).toHaveBeenCalledWith('hello', 't2');
    expect(favorites.remove).toHaveBeenCalledWith('cat');
    expect(result).toEqual({
      syncedIds: ['1', '2', '3'],
      remote: {
        favorites: [{ word: 'hello', createdAt: 't1' }],
        history: [{ word: 'hello', viewedAt: 't2' }],
      },
      error: null,
    });
  });

  it('stops at the first failure keeping the remaining operations', async () => {
    const offline = new NetworkError('offline');
    history.add.mockRejectedValueOnce(offline);

    const result = await useCase.execute(pending);

    expect(result.syncedIds).toEqual(['1']);
    expect(result.remote).toBeNull();
    expect(result.error).toBe(offline);
    expect(favorites.remove).not.toHaveBeenCalled();
  });

  it('only pulls the server copy when there is nothing to push', async () => {
    const result = await useCase.execute([]);

    expect(result.remote?.favorites).toEqual([{ word: 'cat', createdAt: 't0' }]);
    expect(favorites.add).not.toHaveBeenCalled();
  });
});
