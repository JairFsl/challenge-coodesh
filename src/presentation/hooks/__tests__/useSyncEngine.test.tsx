import { onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { container } from 'tsyringe';

import { TOKENS } from '@/di/tokens';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useUserWordsStore } from '@/presentation/stores/userWordsStore';
import {
  FakeFavoritesRepository,
  FakeHistoryRepository,
} from '@/test/fakes/FakeUserWordsRepositories';
import { TestProviders } from '@/test/TestProviders';

import { useSyncEngine } from '../useSyncEngine';

const USER_ID = 'user-1';

function userWords() {
  return useUserWordsStore.getState().byUser[USER_ID];
}

describe('useSyncEngine', () => {
  let favorites: FakeFavoritesRepository;
  let history: FakeHistoryRepository;

  beforeEach(() => {
    favorites = new FakeFavoritesRepository();
    history = new FakeHistoryRepository();
    container.registerInstance(TOKENS.FavoritesRepository, favorites);
    container.registerInstance(TOKENS.HistoryRepository, history);
    onlineManager.setOnline(true);
    useUserWordsStore.setState({ byUser: {}, hasHydrated: true, syncStatus: 'idle' });
    useAuthStore.getState().setUser({ id: USER_ID, email: 'ana@mail.com' });
  });

  afterEach(() => {
    container.clearInstances();
    useAuthStore.getState().setUser(null);
  });

  it('downloads the server copy when the user signs in', async () => {
    history.rows.set('hello', '2026-11-04T10:00:00.000Z');
    favorites.rows.set('cat', '2026-11-04T09:00:00.000Z');

    await renderHook(() => useSyncEngine(), { wrapper: TestProviders });

    await waitFor(() =>
      expect(userWords()?.history).toEqual({ hello: '2026-11-04T10:00:00.000Z' }),
    );
    expect(userWords()?.favorites).toEqual({ cat: '2026-11-04T09:00:00.000Z' });
  });

  it('uploads a local change right after it happens', async () => {
    await renderHook(() => useSyncEngine(), { wrapper: TestProviders });

    await act(async () => useUserWordsStore.getState().toggleFavorite(USER_ID, 'hello'));

    await waitFor(() => expect(favorites.rows.has('hello')).toBe(true));
    await waitFor(() => expect(userWords()?.pending).toEqual([]));
    await waitFor(() => expect(useUserWordsStore.getState().syncStatus).toBe('idle'));
  });

  it('keeps offline changes queued and syncs them when the connection returns', async () => {
    await renderHook(() => useSyncEngine(), { wrapper: TestProviders });
    await waitFor(() => expect(favorites.list).toHaveBeenCalled());

    await act(async () => onlineManager.setOnline(false));
    await act(async () => {
      useUserWordsStore.getState().toggleFavorite(USER_ID, 'hello');
      useUserWordsStore.getState().recordView(USER_ID, 'hello');
    });
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

    expect(favorites.add).not.toHaveBeenCalled();
    expect(userWords()?.pending).toHaveLength(2);
    expect(userWords()?.favorites).toHaveProperty('hello');

    await act(async () => onlineManager.setOnline(true));

    await waitFor(() => expect(userWords()?.pending).toEqual([]));
    expect(favorites.rows.has('hello')).toBe(true);
    expect(history.rows.has('hello')).toBe(true);
  });
});
