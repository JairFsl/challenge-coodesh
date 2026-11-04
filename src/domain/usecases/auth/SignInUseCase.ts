import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';

import type { Credentials, User } from '../../entities';
import type { AuthRepository } from '../../repositories';
import { assertValidCredentials } from '../../validation/credentials';

@injectable()
export class SignInUseCase {
  constructor(@inject(TOKENS.AuthRepository) private readonly authRepository: AuthRepository) {}

  /** Validates the credentials and signs the user in. */
  async execute(credentials: Credentials): Promise<User> {
    return this.authRepository.signIn(assertValidCredentials(credentials));
  }
}
