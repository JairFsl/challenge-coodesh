import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createId } from '@/core/utils/createId';
import { storage } from '@/data/datasources/storage';
import type { PendingOperationType } from '@/domain/entities';
import {
  EMPTY_USER_WORDS,
  enqueueOperation,
  mergeRemote,
  removeSynced,
  type UserWordsState,
} from '@/domain/sync/userWords';
import type { SyncResult } from '@/domain/usecases/sync';

export type SyncStatus = 'idle' | 'syncing' | 'error';

interface UserWordsStore {
  byUser: Record<string, UserWordsState>;
  syncStatus: SyncStatus;
  hasHydrated: boolean;
  toggleFavorite: (userId: string, word: string) => void;
  recordView: (userId: string, word: string) => void;
  applySyncResult: (userId: string, result: SyncResult) => void;
  setSyncStatus: (status: SyncStatus) => void;
}

export const useUserWordsStore = create<UserWordsStore>()(
  persist(
    (set, get) => {
      const enqueue = (userId: string, type: PendingOperationType, word: string) => {
        const current = get().byUser[userId] ?? EMPTY_USER_WORDS;
        const operation = {
          id: createId(),
          userId,
          type,
          word,
          createdAt: new Date().toISOString(),
        };
        set({ byUser: { ...get().byUser, [userId]: enqueueOperation(current, operation) } });
      };

      return {
        byUser: {},
        syncStatus: 'idle',
        hasHydrated: false,
        toggleFavorite: (userId, word) => {
          const isFavorite = Boolean(get().byUser[userId]?.favorites[word]);
          enqueue(userId, isFavorite ? 'favorite.remove' : 'favorite.add', word);
        },
        recordView: (userId, word) => enqueue(userId, 'history.add', word),
        applySyncResult: (userId, { syncedIds, remote, error }) => {
          const current = removeSynced(get().byUser[userId] ?? EMPTY_USER_WORDS, syncedIds);
          set({
            byUser: {
              ...get().byUser,
              [userId]: remote ? mergeRemote(remote, current.pending) : current,
            },
            syncStatus: error ? 'error' : 'idle',
          });
        },
        setSyncStatus: syncStatus => set({ syncStatus }),
      };
    },
    {
      name: 'user-words',
      storage: createJSONStorage(() => storage),
      partialize: state => ({ byUser: state.byUser }),
      onRehydrateStorage: () => () => useUserWordsStore.setState({ hasHydrated: true }),
    },
  ),
);
