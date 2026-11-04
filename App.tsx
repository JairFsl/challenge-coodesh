import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/presentation/components/LoadingScreen';
import { QueryProvider } from '@/presentation/providers/QueryProvider';
import { ThemeProvider, useTheme } from '@/presentation/theme';

function AppContent() {
  const { dark } = useTheme();

  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <LoadingScreen />
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
