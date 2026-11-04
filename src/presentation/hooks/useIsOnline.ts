import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/** Current connectivity, shared with React Query's online manager (fed by NetInfo). */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    listener => onlineManager.subscribe(listener),
    () => onlineManager.isOnline(),
  );
}
