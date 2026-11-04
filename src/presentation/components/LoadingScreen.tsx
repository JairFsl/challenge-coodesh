import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/presentation/theme';

/** Full screen spinner shown while the persisted session is restored. */
export function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View
      testID="loading-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
