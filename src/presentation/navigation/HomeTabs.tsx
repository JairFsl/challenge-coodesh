import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { useTheme } from '@/presentation/theme';

/** Signed-in area: header with the user's e-mail and the sign out action. */
export function HomeTabs() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
