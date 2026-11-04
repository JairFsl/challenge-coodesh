import { useCallback, useMemo } from 'react';

import { EMPTY_USER_WORDS, toFavoriteList, toHistoryList } from '@/domain/sync/userWords';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useUserWordsStore } from '@/presentation/stores/userWordsStore';

/** Favorites, history and pending changes of the signed-in user, with the actions to change them. */
export function useUserWords() {
  const userId = useAuthStore(state => state.user?.id);
  const userWords = useUserWordsStore(
    state => (userId && state.byUser[userId]) || EMPTY_USER_WORDS,
  );
  const toggle = useUserWordsStore(state => state.toggleFavorite);
  const record = useUserWordsStore(state => state.recordView);

  const favorites = useMemo(() => toFavoriteList(userWords).map(f => f.word), [userWords]);
  const history = useMemo(() => toHistoryList(userWords).map(h => h.word), [userWords]);

  const isFavorite = useCallback((word: string) => Boolean(userWords.favorites[word]), [userWords]);
  const toggleFavorite = useCallback(
    (word: string) => userId && toggle(userId, word),
    [userId, toggle],
  );
  const recordView = useCallback(
    (word: string) => userId && record(userId, word),
    [userId, record],
  );

  return {
    favorites,
    history,
    pendingCount: userWords.pending.length,
    isFavorite,
    toggleFavorite,
    recordView,
  };
}
