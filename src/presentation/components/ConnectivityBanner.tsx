import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useIsOnline } from '@/presentation/hooks/useIsOnline';
import { useUserWords } from '@/presentation/hooks/useUserWords';
import { useTheme } from '@/presentation/theme';

/** Offline warning and the number of local changes waiting to be synced. */
export function ConnectivityBanner() {
  const isOnline = useIsOnline();
  const { pendingCount } = useUserWords();
  const { colors, spacing, typography } = useTheme();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  const changes = pendingCount === 1 ? '1 alteração' : `${pendingCount} alterações`;
  const message = isOnline
    ? `Sincronizando ${changes}…`
    : `Você está offline. Mostrando dados salvos no aparelho.${
        pendingCount > 0 ? ` ${changes} aguardando sincronização.` : ''
      }`;

  return (
    <Text
      testID={isOnline ? 'sync-banner' : 'offline-banner'}
      accessibilityRole="alert"
      style={[
        typography.caption,
        styles.banner,
        {
          backgroundColor: isOnline ? colors.primaryMuted : colors.warning,
          color: isOnline ? colors.text : colors.onPrimary,
          padding: spacing.xs,
        },
      ]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  banner: { textAlign: 'center' },
});
