import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import React from 'react';

import type { Credentials } from '@/domain/entities';
import { SignInUseCase } from '@/domain/usecases/auth';
import { AuthForm } from '@/presentation/components/AuthForm';
import { useDependency } from '@/presentation/hooks/useDependency';
import type { RootStackParamList } from '@/presentation/navigation/types';

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

/** Sign in with e-mail and password. Navigation to Home happens via the auth session. */
export function SignInScreen({ navigation }: SignInScreenProps) {
  const signIn = useDependency(SignInUseCase);
  const { mutate, isPending, error } = useMutation({
    mutationFn: (credentials: Credentials) => signIn.execute(credentials),
  });

  return (
    <AuthForm
      title="Entrar"
      subtitle="Acesse sua conta para ver seus favoritos e histórico."
      submitLabel="Entrar"
      switchLabel="Não tem conta? Criar conta"
      isSubmitting={isPending}
      error={error}
      onSubmit={mutate}
      onSwitch={() => navigation.replace('SignUp')}
    />
  );
}
