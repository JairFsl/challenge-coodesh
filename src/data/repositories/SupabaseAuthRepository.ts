import {
  isAuthError,
  isAuthRetryableFetchError,
  type SupabaseClient,
  type User as SupabaseUser,
} from '@supabase/supabase-js';
import { inject, injectable } from 'tsyringe';

import { AuthError, NetworkError, type AuthErrorCode } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import type { Credentials, User } from '@/domain/entities';
import type { AuthRepository } from '@/domain/repositories';

const ERROR_CODES: Record<string, AuthErrorCode> = {
  invalid_credentials: 'invalid_credentials',
  user_already_exists: 'email_taken',
  email_exists: 'email_taken',
  weak_password: 'weak_password',
  email_address_invalid: 'invalid_email',
  over_request_rate_limit: 'rate_limited',
};

@injectable()
export class SupabaseAuthRepository implements AuthRepository {
  constructor(@inject(TOKENS.SupabaseClient) private readonly supabase: SupabaseClient) {}

  /** Signs in with e-mail and password (Supabase persists the session in AsyncStorage). */
  async signIn({ email, password }: Credentials): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw toDomainError(error);
    }
    return toUser(data.user);
  }

  /**
   * Creates the account. "Confirm email" is disabled in the project, so Supabase
   * returns the session right away and the user is already signed in.
   */
  async signUp({ email, password }: Credentials): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) {
      throw toDomainError(error);
    }
    if (!data.user || !data.session) {
      throw new AuthError('unknown');
    }
    return toUser(data.user);
  }

  /** Revokes the session; the local session is cleared even if the request fails offline. */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut({ scope: 'local' });
    if (error) {
      throw toDomainError(error);
    }
  }

  /**
   * Supabase emits INITIAL_SESSION (restored from storage, works offline) on subscribe,
   * then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED. The callback must stay synchronous:
   * awaiting other Supabase calls inside it can deadlock the auth client.
   */
  onAuthStateChange(listener: (user: User | null) => void): () => void {
    const { data } = this.supabase.auth.onAuthStateChange((_event, session) => {
      listener(session ? toUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
}

/** Maps a Supabase auth user to the domain user. */
function toUser(user: SupabaseUser): User {
  return { id: user.id, email: user.email ?? '' };
}

/** Converts Supabase/network failures into domain errors the UI knows how to present. */
function toDomainError(error: unknown): Error {
  if (isAuthRetryableFetchError(error)) {
    return new NetworkError('Auth request failed', error);
  }
  if (isAuthError(error)) {
    return new AuthError(ERROR_CODES[error.code ?? ''] ?? 'unknown', error);
  }
  return new AuthError('unknown', error);
}
