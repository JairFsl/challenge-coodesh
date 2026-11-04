import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import React, { type PropsWithChildren } from 'react';

import { CACHE_MAX_AGE_MS, STALE_TIME_MS } from '@/core/config/constants';
import { NetworkError } from '@/core/errors';
import { storage } from '@/data/datasources/storage';

/**
 * Feeds React Query's online state from NetInfo. The initial `fetch` is ignored when a
 * change event arrives first, otherwise a stale snapshot taken while the network was
 * switching would override the newer event and leave the app stuck online.
 */
export function listenToConnectivity(setOnline: (online: boolean) => void) {
  let hasEvent = false;
  const update = (state: NetInfoState) => setOnline(state.isConnected !== false);
  NetInfo.fetch().then(state => !hasEvent && update(state));
  return NetInfo.addEventListener(state => {
    hasEvent = true;
    update(state);
  });
}

onlineManager.setEventListener(listenToConnectivity);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_MAX_AGE_MS,
      staleTime: STALE_TIME_MS,
      retry: (failureCount, error) => error instanceof NetworkError && failureCount < 2,
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

const persister = createAsyncStoragePersister({ storage, key: 'query-cache' });

/** Provides React Query with its cache persisted to AsyncStorage. */
export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE_MS }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
