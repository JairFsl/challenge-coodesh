import { useEffect } from 'react';

import { TOKENS } from '@/di/tokens';
import type { AuthRepository } from '@/domain/repositories';
import { useAuthStore } from '@/presentation/stores/authStore';

import { useDependency } from './useDependency';

/** Keeps the auth store in sync with the persisted session and returns the current status. */
export function useAuthSession() {
  const authRepository = useDependency<AuthRepository>(TOKENS.AuthRepository);
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => authRepository.onAuthStateChange(setUser), [authRepository, setUser]);

  return useAuthStore(state => state.status);
}
