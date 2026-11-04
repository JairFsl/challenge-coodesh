import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ValidationError } from '@/core/errors';
import type { Credentials } from '@/domain/entities';
import { useTheme } from '@/presentation/theme';
import { getErrorMessage, getFieldErrorMessage } from '@/presentation/utils/errorMessages';

import { Button } from './Button';
import { TextField } from './TextField';

interface AuthFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  switchLabel: string;
  isSubmitting: boolean;
  error: unknown;
  onSubmit: (credentials: Credentials) => void;
  onSwitch: () => void;
}

/** E-mail and password form shared by the sign in and sign up screens. */
export function AuthForm({
  title,
  subtitle,
  submitLabel,
  switchLabel,
  isSubmitting,
  error,
  onSubmit,
  onSwitch,
}: AuthFormProps) {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fieldErrors = error instanceof ValidationError ? error.fields : {};
  const formError = error && !(error instanceof ValidationError) ? getErrorMessage(error) : null;
  const handleSubmit = () => onSubmit({ email, password });

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.xl,
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={{ gap: spacing.sm, marginBottom: spacing.xxl }}>
          <Text testID="auth-title" style={[typography.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>

        <View style={{ gap: spacing.lg }}>
          <TextField
            testID="email-input"
            label="E-mail"
            placeholder="voce@email.com"
            value={email}
            onChangeText={setEmail}
            error={getFieldErrorMessage(fieldErrors.email)}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!isSubmitting}
          />
          <TextField
            testID="password-input"
            label="Senha"
            placeholder="Mínimo de 6 caracteres"
            value={password}
            onChangeText={setPassword}
            error={getFieldErrorMessage(fieldErrors.password)}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            editable={!isSubmitting}
          />

          {formError ? (
            <Text
              testID="auth-error"
              accessibilityRole="alert"
              style={[typography.label, { color: colors.danger }]}
            >
              {formError}
            </Text>
          ) : null}

          <Button
            testID="submit-button"
            title={submitLabel}
            loading={isSubmitting}
            onPress={handleSubmit}
          />
          <Button
            testID="switch-auth-button"
            title={switchLabel}
            variant="ghost"
            disabled={isSubmitting}
            onPress={onSwitch}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center' },
});
