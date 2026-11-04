import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { SYNC_DEBOUNCE_MS, SYNC_RETRY_DELAY_MS } from '@/core/config/constants';
import { SyncUserWordsUseCase } from '@/domain/usecases/sync';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useUserWordsStore } from '@/presentation/stores/userWordsStore';

import { useDependency } from './useDependency';

/**
 * Keeps the signed-in user's favorites and history in sync with the server: runs on
 * sign in, when the connection comes back, when the app returns to the foreground and
 * after every local change. Only one sync runs at a time and failures are retried.
 */
export function useSyncEngine() {
  const userId = useAuthStore(state => state.user?.id);
  const hasHydrated = useUserWordsStore(state => state.hasHydrated);
  const syncUserWords = useDependency(SyncUserWordsUseCase);

  useEffect(() => {
    if (!userId || !hasHydrated) {
      return;
    }

    let running = false;
    let rerun = false;
    let disposed = false;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      if (disposed || !onlineManager.isOnline()) {
        return;
      }
      if (running) {
        rerun = true;
        return;
      }
      running = true;
      clearTimeout(retryTimer);

      const store = useUserWordsStore.getState();
      store.setSyncStatus('syncing');
      const result = await syncUserWords.execute(store.byUser[userId]?.pending ?? []);
      useUserWordsStore.getState().applySyncResult(userId, result);

      running = false;
      if (result.error && !disposed) {
        retryTimer = setTimeout(run, SYNC_RETRY_DELAY_MS);
      }
      if (rerun) {
        rerun = false;
        run();
      }
    };

    const schedule = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, SYNC_DEBOUNCE_MS);
    };

    run();
    const unsubscribeOnline = onlineManager.subscribe(isOnline => isOnline && run());
    const appStateSubscription = AppState.addEventListener(
      'change',
      state => state === 'active' && run(),
    );
    const unsubscribeStore = useUserWordsStore.subscribe((state, previous) => {
      const pending = state.byUser[userId]?.pending ?? [];
      const previousPending = previous.byUser[userId]?.pending ?? [];
      if (pending.length > 0 && pending.at(-1)?.id !== previousPending.at(-1)?.id) {
        schedule();
      }
    });

    return () => {
      disposed = true;
      clearTimeout(debounceTimer);
      clearTimeout(retryTimer);
      unsubscribeOnline();
      appStateSubscription.remove();
      unsubscribeStore();
    };
  }, [userId, hasHydrated, syncUserWords]);
}
