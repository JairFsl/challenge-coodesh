import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';

import type { Credentials, User } from '../../entities';
import type { AuthRepository } from '../../repositories';
import { assertValidCredentials } from '../../validation/credentials';

@injectable()
export class SignUpUseCase {
  constructor(@inject(TOKENS.AuthRepository) private readonly authRepository: AuthRepository) {}

  /** Validates the credentials and creates a new account already signed in. */
  async execute(credentials: Credentials): Promise<User> {
    return this.authRepository.signUp(assertValidCredentials(credentials));
  }
}
