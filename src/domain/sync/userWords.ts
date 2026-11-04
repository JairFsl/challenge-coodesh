import type { FavoriteWord, HistoryEntry, PendingOperation } from '../entities';

export interface UserWordsState {
  favorites: Record<string, string>;
  history: Record<string, string>;
  pending: PendingOperation[];
}

export interface RemoteUserWords {
  favorites: FavoriteWord[];
  history: HistoryEntry[];
}

export const EMPTY_USER_WORDS: UserWordsState = { favorites: {}, history: {}, pending: [] };

/** Applies a local change to favorites/history (the same rules the server follows). */
export function applyOperation(state: UserWordsState, operation: PendingOperation): UserWordsState {
  const { word, createdAt } = operation;
  switch (operation.type) {
    case 'favorite.add':
      return state.favorites[word]
        ? state
        : { ...state, favorites: { ...state.favorites, [word]: createdAt } };
    case 'favorite.remove': {
      const favorites = { ...state.favorites };
      delete favorites[word];
      return { ...state, favorites };
    }
    case 'history.add': {
      const current = state.history[word];
      return current && current >= createdAt
        ? state
        : { ...state, history: { ...state.history, [word]: createdAt } };
    }
  }
}

/** Applies the change and queues it, keeping only the latest pending change per word. */
export function enqueueOperation(
  state: UserWordsState,
  operation: PendingOperation,
): UserWordsState {
  const key = operationKey(operation);
  return {
    ...applyOperation(state, operation),
    pending: [...state.pending.filter(pending => operationKey(pending) !== key), operation],
  };
}

/** Replaces local data with the server copy and re-applies changes not synced yet. */
export function mergeRemote(remote: RemoteUserWords, pending: PendingOperation[]): UserWordsState {
  const base: UserWordsState = {
    favorites: Object.fromEntries(remote.favorites.map(f => [f.word, f.createdAt])),
    history: Object.fromEntries(remote.history.map(h => [h.word, h.viewedAt])),
    pending,
  };
  return pending.reduce(applyOperation, base);
}

/** Removes the operations already confirmed by the server. */
export function removeSynced(state: UserWordsState, syncedIds: string[]): UserWordsState {
  const synced = new Set(syncedIds);
  return { ...state, pending: state.pending.filter(operation => !synced.has(operation.id)) };
}

/** Favorites, most recent first. */
export function toFavoriteList(state: UserWordsState): FavoriteWord[] {
  return Object.entries(state.favorites)
    .map(([word, createdAt]) => ({ word, createdAt }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Viewed words, most recent view first. */
export function toHistoryList(state: UserWordsState): HistoryEntry[] {
  return Object.entries(state.history)
    .map(([word, viewedAt]) => ({ word, viewedAt }))
    .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt));
}

function operationKey({ type, word }: PendingOperation): string {
  return `${type.split('.')[0]}:${word}`;
}
