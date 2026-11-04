import type { Credentials, User } from '../entities';

export interface AuthRepository {
  /** @throws AuthError with code `invalid_credentials` when e-mail or password don't match */
  signIn(credentials: Credentials): Promise<User>;
  /** Creates the account and starts a session. @throws AuthError with code `email_taken` */
  signUp(credentials: Credentials): Promise<User>;
  signOut(): Promise<void>;
  /** Emits the persisted session on subscribe and every sign in / sign out / expiration. */
  onAuthStateChange(listener: (user: User | null) => void): () => void;
}
