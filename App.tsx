import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/presentation/components/LoadingScreen';
import { useAuthSession } from '@/presentation/hooks/useAuthSession';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { QueryProvider } from '@/presentation/providers/QueryProvider';
import { ThemeProvider, useTheme } from '@/presentation/theme';

function AppContent() {
  const { dark } = useTheme();
  const status = useAuthSession();

  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      {status === 'loading' ? (
        <LoadingScreen />
      ) : (
        <RootNavigator isSignedIn={status === 'signedIn'} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <AppContent />
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
