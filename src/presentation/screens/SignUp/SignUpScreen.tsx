import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import React from 'react';

import type { Credentials } from '@/domain/entities';
import { SignUpUseCase } from '@/domain/usecases/auth';
import { AuthForm } from '@/presentation/components/AuthForm';
import { useDependency } from '@/presentation/hooks/useDependency';
import type { RootStackParamList } from '@/presentation/navigation/types';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

/** Creates an account with e-mail and password and signs the user in right away. */
export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const signUp = useDependency(SignUpUseCase);
  const { mutate, isPending, error } = useMutation({
    mutationFn: (credentials: Credentials) => signUp.execute(credentials),
  });

  return (
    <AuthForm
      title="Criar conta"
      subtitle="Salve suas palavras favoritas e acompanhe seu histórico."
      submitLabel="Criar conta"
      switchLabel="Já tem conta? Entrar"
      isSubmitting={isPending}
      error={error}
      onSubmit={mutate}
      onSwitch={() => navigation.replace('SignIn')}
    />
  );
}
