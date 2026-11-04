import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, type PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/presentation/theme';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Wraps a component with the app providers using an isolated, non-persisted query client. */
export function TestProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity },
          mutations: { retry: false, gcTime: Infinity },
        },
      }),
  );

  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
