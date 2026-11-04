import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/presentation/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Labeled text input with an optional error message below it. */
export function TextField({ label, error, style, ...inputProps }: TextFieldProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={[
          styles.input,
          typography.body,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 48, borderWidth: 1 },
});
