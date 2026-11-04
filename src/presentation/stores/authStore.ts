import { create } from 'zustand';

import type { User } from '@/domain/entities';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  status: 'loading',
  user: null,
  setUser: user => set({ user, status: user ? 'signedIn' : 'signedOut' }),
}));
