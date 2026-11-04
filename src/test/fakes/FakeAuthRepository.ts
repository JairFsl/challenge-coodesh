import type { Credentials, User } from '@/domain/entities';
import type { AuthRepository } from '@/domain/repositories';

/** In-memory AuthRepository used by tests through the DI container. */
export class FakeAuthRepository implements AuthRepository {
  signIn = jest.fn(async ({ email }: Credentials): Promise<User> => ({ id: 'user-1', email }));
  signUp = jest.fn(async ({ email }: Credentials): Promise<User> => ({ id: 'user-1', email }));
  signOut = jest.fn(async () => {});
  onAuthStateChange = jest.fn((_listener: (user: User | null) => void) => () => {});
}
