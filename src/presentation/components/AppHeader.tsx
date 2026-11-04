import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignOutUseCase } from '@/domain/usecases/auth';
import { useDependency } from '@/presentation/hooks/useDependency';
import { useAuthStore } from '@/presentation/stores/authStore';
import { useTheme } from '@/presentation/theme';

import { Button } from './Button';

/** Top bar with the signed-in user's e-mail and the sign out action. */
export function AppHeader() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const email = useAuthStore(state => state.user?.email);
  const signOut = useDependency(SignOutUseCase);
  const { mutate, isPending } = useMutation({ mutationFn: () => signOut.execute() });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingLeft: spacing.lg,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text
        testID="user-email"
        numberOfLines={1}
        style={[typography.caption, styles.email, { color: colors.textMuted }]}
      >
        {email}
      </Text>
      <Button
        testID="sign-out-button"
        title="Sair"
        variant="ghost"
        loading={isPending}
        onPress={() => mutate()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  email: { flex: 1, marginRight: 12 },
});
