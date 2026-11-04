import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/presentation/theme';

import { Button } from './Button';

interface StateMessageProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Centered message for empty, error and offline states with an optional action. */
export function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: StateMessageProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View testID={testID} style={[styles.container, { padding: spacing.xl, gap: spacing.sm }]}>
      <Text style={[typography.heading, styles.center, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[typography.body, styles.center, { color: colors.textMuted }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="ghost" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
