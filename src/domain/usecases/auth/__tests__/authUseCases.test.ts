import { container } from 'tsyringe';

import { ValidationError } from '@/core/errors';
import { TOKENS } from '@/di/tokens';
import { SignInUseCase, SignOutUseCase, SignUpUseCase } from '@/domain/usecases/auth';
import { FakeAuthRepository } from '@/test/fakes/FakeAuthRepository';

describe('auth use cases', () => {
  let authRepository: FakeAuthRepository;
  let scope: typeof container;

  beforeEach(() => {
    authRepository = new FakeAuthRepository();
    scope = container.createChildContainer();
    scope.registerInstance(TOKENS.AuthRepository, authRepository);
  });

  it('resolves the use cases with the repository injected by the container', async () => {
    const user = await scope.resolve(SignInUseCase).execute({
      email: ' Ana@Mail.com',
      password: '123456',
    });

    expect(authRepository.signIn).toHaveBeenCalledWith({
      email: 'ana@mail.com',
      password: '123456',
    });
    expect(user).toEqual({ id: 'user-1', email: 'ana@mail.com' });
  });

  it('does not reach the repository when the credentials are invalid', async () => {
    await expect(
      scope.resolve(SignUpUseCase).execute({ email: 'invalid', password: '1' }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(authRepository.signUp).not.toHaveBeenCalled();
  });

  it('signs out through the repository', async () => {
    await scope.resolve(SignOutUseCase).execute();

    expect(authRepository.signOut).toHaveBeenCalledTimes(1);
  });
});
