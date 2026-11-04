import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@/di/tokens';

import type { AuthRepository } from '../../repositories';

@injectable()
export class SignOutUseCase {
  constructor(@inject(TOKENS.AuthRepository) private readonly authRepository: AuthRepository) {}

  /** Ends the current session. */
  execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}
