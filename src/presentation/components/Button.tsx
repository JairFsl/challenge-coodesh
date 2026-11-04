import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { useTheme } from '@/presentation/theme';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
}

/** Pressable button with primary (filled), outline and ghost (text only) variants. */
export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...pressableProps
}: ButtonProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;
  const textColor = isPrimary ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={state => [
        styles.base,
        {
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: isDisabled ? 0.6 : state.pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 48, alignItems: 'center', justifyContent: 'center' },
});
