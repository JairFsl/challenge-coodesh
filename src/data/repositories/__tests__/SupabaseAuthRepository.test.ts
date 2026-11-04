import { AuthApiError, AuthRetryableFetchError, type SupabaseClient } from '@supabase/supabase-js';

import { AuthError, NetworkError } from '@/core/errors';

import { SupabaseAuthRepository } from '../SupabaseAuthRepository';

const supabaseUser = { id: 'user-1', email: 'ana@mail.com' };
const credentials = { email: 'ana@mail.com', password: '123456' };

function createRepository(auth: Partial<SupabaseClient['auth']>) {
  return new SupabaseAuthRepository({ auth } as unknown as SupabaseClient);
}

describe('SupabaseAuthRepository', () => {
  it('returns the domain user after signing in', async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: supabaseUser, session: {} },
      error: null,
    });

    const user = await createRepository({ signInWithPassword }).signIn(credentials);

    expect(signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(user).toEqual({ id: 'user-1', email: 'ana@mail.com' });
  });

  it.each([
    ['invalid_credentials', 'invalid_credentials'],
    ['user_already_exists', 'email_taken'],
    ['weak_password', 'weak_password'],
    ['something_new', 'unknown'],
  ])('maps the Supabase error "%s" to the domain code "%s"', async (supabaseCode, domainCode) => {
    const signUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError('failed', 400, supabaseCode),
    });

    const promise = createRepository({ signUp }).signUp(credentials);

    await expect(promise).rejects.toBeInstanceOf(AuthError);
    await expect(promise).rejects.toHaveProperty('code', domainCode);
  });

  it('maps connectivity failures to NetworkError', async () => {
    const signInWithPassword = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthRetryableFetchError('Network request failed', 0),
    });

    await expect(
      createRepository({ signInWithPassword }).signIn(credentials),
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it('notifies the current user and unsubscribes from Supabase', () => {
    const unsubscribe = jest.fn();
    const onAuthStateChange = jest.fn(callback => {
      callback('INITIAL_SESSION', { user: supabaseUser });
      return { data: { subscription: { unsubscribe } } };
    });
    const listener = jest.fn();

    const stop = createRepository({ onAuthStateChange } as never).onAuthStateChange(listener);
    stop();

    expect(listener).toHaveBeenCalledWith({ id: 'user-1', email: 'ana@mail.com' });
    expect(unsubscribe).toHaveBeenCalled();
  });
});
